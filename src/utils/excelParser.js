import * as xlsx from "xlsx";
import { format, isValid, differenceInMinutes } from "date-fns";
export function parseBiometricLogs(fileBuffer) {
    const workbook = xlsx.read(fileBuffer, { type: "buffer", cellDates: true });
    const allEmployeesAttendance = [];
    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        // Read raw data as 2D array
        const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        // Assuming first row might be headers, we process rows directly.
        // If we assume Column A is ID/Name and Column B is Datetime
        const scans = [];
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row.length < 2)
                continue; // Skip incomplete rows
            const valA = row[0]; // ID / Name (usually same as sheetName, but can vary)
            let valB = row[1]; // Datetime
            // Excel date serial number to JS Date if it comes as number
            let dateObj = null;
            if (valB instanceof Date) {
                // xlsx cellDates: true returns UTC dates where the UTC time is the face value time.
                // Shift it to local time so that getHours() returns the face value hour
                dateObj = new Date(valB.getUTCFullYear(), valB.getUTCMonth(), valB.getUTCDate(), valB.getUTCHours(), valB.getUTCMinutes(), valB.getUTCSeconds());
            }
            else if (typeof valB === 'number') {
                const utcDate = new Date(Math.round((valB - 25569) * 86400 * 1000));
                dateObj = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds());
            }
            else if (typeof valB === 'string') {
                dateObj = new Date(valB);
            }
            if (dateObj && isValid(dateObj)) {
                scans.push({ timestamp: dateObj });
            }
        }
        // Sort scans chronologically
        scans.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        // Group by Date (YYYY-MM-DD)
        const groupedByDate = {};
        for (const scan of scans) {
            const dateStr = format(scan.timestamp, "yyyy-MM-dd");
            if (!groupedByDate[dateStr])
                groupedByDate[dateStr] = [];
            groupedByDate[dateStr].push(scan.timestamp);
        }
        const records = [];
        for (const [dateStr, dailyScans] of Object.entries(groupedByDate)) {
            // Filter out duplicate accidental scans (e.g., within 2 minutes)
            const validScans = [];
            for (const scan of dailyScans) {
                if (validScans.length === 0) {
                    validScans.push(scan);
                }
                else {
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
            let amIn = null;
            let amOut = null;
            let pmIn = null;
            let pmOut = null;
            for (const scan of validScans) {
                const hour = scan.getHours();
                const timeVal = hour + scan.getMinutes() / 60;
                // AM IN (04:00 to 10:59)
                if (timeVal >= 4 && timeVal < 11) {
                    if (!amIn)
                        amIn = scan;
                }
                // PM OUT (15:00 to 23:59)
                else if (timeVal >= 15 && timeVal < 24) {
                    pmOut = scan; // keep updating to the latest
                }
            }
            // Middle scans (11:00 to 14:59)
            const midScans = validScans.filter(s => {
                const t = s.getHours() + s.getMinutes() / 60;
                return t >= 11 && t < 15;
            });
            if (midScans.length === 1) {
                const t = midScans[0].getHours() + midScans[0].getMinutes() / 60;
                if (t < 12.5) {
                    amOut = midScans[0];
                }
                else {
                    pmIn = midScans[0];
                }
            }
            else if (midScans.length >= 2) {
                amOut = midScans[0];
                pmIn = midScans[midScans.length - 1];
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
