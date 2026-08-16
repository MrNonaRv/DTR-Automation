const fs = require('fs');
const content = `import * as xlsx from "xlsx";
import { format, parse, isValid, differenceInMinutes, parseISO } from "date-fns";

export interface AttendanceRecord {
  date: string;
  amIn: string | null;
  amOut: string | null;
  pmIn: string | null;
  pmOut: string | null;
}

export interface EmployeeAttendance {
  id?: string;
  employeeIdOrName: string;
  records: AttendanceRecord[];
  createdAt?: any;
}

export function parseBiometricLogs(fileBuffer: Buffer): EmployeeAttendance[] {
  const workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: true });
  const allEmployeesAttendance: EmployeeAttendance[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    // Read raw data as 2D array
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Assuming first row might be headers, we process rows directly.
    // If we assume Column A is ID/Name and Column B is Datetime
    const scans: { timestamp: Date }[] = [];
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.length < 2) continue; // Skip incomplete rows

      const valA = row[0]; // ID / Name (usually same as sheetName, but can vary)
      let valB = row[1]; // Datetime

      // Excel date serial number to JS Date if it comes as number
      let dateObj: Date | null = null;
      if (valB instanceof Date) {
        // xlsx cellDates: true returns UTC dates where the UTC time is the face value time.
        // Shift it to local time so that getHours() returns the face value hour
        dateObj = new Date(valB.getUTCFullYear(), valB.getUTCMonth(), valB.getUTCDate(), valB.getUTCHours(), valB.getUTCMinutes(), valB.getUTCSeconds());
      } else if (typeof valB === 'number') {
        const utcDate = new Date(Math.round((valB - 25569) * 86400 * 1000));
        dateObj = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds());
      } else if (typeof valB === 'string') {
        dateObj = new Date(valB);
      }
      
      if (dateObj && isValid(dateObj)) {
        scans.push({ timestamp: dateObj });
      }
    }

    // Sort scans chronologically
    scans.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Group by Date (YYYY-MM-DD)
    const groupedByDate: Record<string, Date[]> = {};
    for (const scan of scans) {
      const dateStr = format(scan.timestamp, "yyyy-MM-dd");
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(scan.timestamp);
    }

    const records: AttendanceRecord[] = [];
    for (const [dateStr, dailyScans] of Object.entries(groupedByDate)) {
      // Filter out duplicate accidental scans (e.g., within 1 minute)
      const validScans: Date[] = [];
      for (const scan of dailyScans) {
        if (validScans.length === 0) {
          validScans.push(scan);
        } else {
          const lastScan = validScans[validScans.length - 1];
          if (scan.getTime() - lastScan.getTime() > 60000) { // 1 minute
            validScans.push(scan);
          }
        }
      }

      let amIn: Date | null = null;
      let amOut: Date | null = null;
      let pmIn: Date | null = null;
      let pmOut: Date | null = null;
      
      if (validScans.length === 4) {
         amIn = validScans[0];
         amOut = validScans[1];
         pmIn = validScans[2];
         pmOut = validScans[3];
      } else if (validScans.length === 2) {
         const t0 = validScans[0].getHours() + validScans[0].getMinutes() / 60;
         const t1 = validScans[1].getHours() + validScans[1].getMinutes() / 60;
         if (t0 < 12 && t1 >= 12) {
             amIn = validScans[0];
             pmOut = validScans[1];
         } else if (t0 < 12 && t1 < 12) {
             amIn = validScans[0];
             amOut = validScans[1];
         } else {
             pmIn = validScans[0];
             pmOut = validScans[1];
         }
      } else {
         for (const scan of validScans) {
             const t = scan.getHours() + scan.getMinutes()/60;
             if (t < 11) {
                 if (!amIn) amIn = scan;
             } else if (t >= 11 && t < 13) {
                 if (!amOut) amOut = scan;
                 else if (!pmIn) pmIn = scan;
             } else if (t >= 13 && t < 15) {
                 if (!pmIn) pmIn = scan;
                 else if (!amOut && t < 13.5) amOut = scan; 
             } else {
                 pmOut = scan; // Keep updating to the latest scan for PM Out
             }
         }
      }

      records.push({
        date: dateStr,
        amIn: amIn ? format(amIn, "h:mm a") : null,
        amOut: amOut ? format(amOut, "h:mm a") : null,
        pmIn: pmIn ? format(pmIn, "h:mm a") : null,
        pmOut: pmOut ? format(pmOut, "h:mm a") : null,
      });
    }

    allEmployeesAttendance.push({
      employeeIdOrName: sheetName,
      records,
    });
  }

  return allEmployeesAttendance;
}
`;
fs.writeFileSync('src/utils/excelParser.ts', content);
