import * as xlsx from "xlsx";
import { format, parse, isValid, differenceInMinutes, parseISO } from "date-fns";

export interface AttendanceRecord {
  date: string;
  amIn: string | null;
  amOut: string | null;
  pmIn: string | null;
  pmOut: string | null;
}

export interface EmployeeAttendance {
  employeeIdOrName: string;
  records: AttendanceRecord[];
}

export function parseBiometricLogs(fileBuffer: Buffer): EmployeeAttendance[] {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
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

      if (typeof valB === 'number') {
        // Excel serial date to JS Date
        // 25569 is the difference in days between Excel epoch (1900-01-01) and Unix epoch (1970-01-01)
        const unixTimestamp = (valB - 25569) * 86400 * 1000; 
        
        // This is a naive conversion, it might need tz offset adjustment depending on how it's written
        // A safer way if it's purely a number and read properly by XLSX:
        // xlsx library has cell.w or cell.v which might be better, but we read as array here.
        // Let's use xlsx standard cell processing if possible.
        // Or simply:
        dateObj = new Date(Math.round(unixTimestamp));
      } else if (typeof valB === 'string') {
        // e.g., '2026-07-01 12:20:32'
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
      // Filter out duplicate accidental scans (e.g., within 2 minutes)
      const validScans: Date[] = [];
      for (const scan of dailyScans) {
        if (validScans.length === 0) {
          validScans.push(scan);
        } else {
          const lastScan = validScans[validScans.length - 1];
          if (Math.abs(differenceInMinutes(scan, lastScan)) > 2) {
            validScans.push(scan);
          }
        }
      }

      // Bucketing logic
      // AM_IN: The earliest scan between 05:00 and 11:59.
      // AM_OUT: The latest scan between 11:00 and 13:00.
      // PM_IN: The earliest scan between 12:00 and 14:00.
      // PM_OUT: The latest scan between 15:00 and 23:59.
      
      let amIn: Date | null = null;
      let amOut: Date | null = null;
      let pmIn: Date | null = null;
      let pmOut: Date | null = null;

      for (const scan of validScans) {
        const hour = scan.getHours();
        
        // AM IN
        if (hour >= 5 && hour < 12) {
          if (!amIn || scan < amIn) amIn = scan;
        }

        // AM OUT
        if (hour >= 11 && hour < 13) {
          if (!amOut || scan > amOut) amOut = scan;
        }

        // PM IN
        if (hour >= 12 && hour < 14) {
          if (!pmIn || scan < pmIn) pmIn = scan;
        }

        // PM OUT
        if (hour >= 15 && hour < 24) {
          if (!pmOut || scan > pmOut) pmOut = scan;
        }
      }

      records.push({
        date: dateStr,
        amIn: amIn ? format(amIn, "HH:mm") : null,
        amOut: amOut ? format(amOut, "HH:mm") : null,
        pmIn: pmIn ? format(pmIn, "HH:mm") : null,
        pmOut: pmOut ? format(pmOut, "HH:mm") : null,
      });
    }

    allEmployeesAttendance.push({
      employeeIdOrName: sheetName,
      records,
    });
  }

  return allEmployeesAttendance;
}
