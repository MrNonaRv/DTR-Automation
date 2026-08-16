const fs = require('fs');
let code = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

code = code.replace(
  `    const scans: { timestamp: Date }[] = [];
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.length < 2) continue; // Skip incomplete rows
      const valA = row[0]; // ID / Name (usually same as sheetName, but can vary)
      let valB = row[1]; // Datetime`,
  `    const scans: { timestamp: Date, status?: number }[] = [];
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.length < 2) continue; // Skip incomplete rows
      const valA = row[0]; // ID / Name (usually same as sheetName, but can vary)
      let valB = row[1]; // Datetime
      let valC = row[2]; // Status (optional, from our improved converter)`
);

code = code.replace(
  `      if (dateObj && isValid(dateObj)) {
        scans.push({ timestamp: dateObj });
      }`,
  `      if (dateObj && isValid(dateObj)) {
        const status = (typeof valC === 'number' && !isNaN(valC)) ? valC : undefined;
        scans.push({ timestamp: dateObj, status });
      }`
);

code = code.replace(
  `    // Group by Date (YYYY-MM-DD)
    const groupedByDate: Record<string, Date[]> = {};
    for (const scan of scans) {
      const dateStr = format(scan.timestamp, "yyyy-MM-dd");
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(scan.timestamp);
    }`,
  `    // Group by Date (YYYY-MM-DD)
    const groupedByDate: Record<string, { timestamp: Date, status?: number }[]> = {};
    for (const scan of scans) {
      const dateStr = format(scan.timestamp, "yyyy-MM-dd");
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(scan);
    }`
);

code = code.replace(
  `    const records: AttendanceRecord[] = [];
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
      }`,
  `    const records: AttendanceRecord[] = [];
    for (const [dateStr, dailyScans] of Object.entries(groupedByDate)) {
      // Filter out duplicate accidental scans (e.g., within 1 minute)
      const validScans: { timestamp: Date, status?: number }[] = [];
      for (const scan of dailyScans) {
        if (validScans.length === 0) {
          validScans.push(scan);
        } else {
          const lastScan = validScans[validScans.length - 1];
          if (scan.timestamp.getTime() - lastScan.timestamp.getTime() > 60000) { // 1 minute
            validScans.push(scan);
          }
        }
      }`
);

code = code.replace(
  `      let amIn: Date | null = null;
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
      }`,
  `      let amIn: Date | null = null;
      let amOut: Date | null = null;
      let pmIn: Date | null = null;
      let pmOut: Date | null = null;
      
      const hasStatus = validScans.some(s => s.status !== undefined);
      
      if (hasStatus) {
         // Smart routing based on Check-in (0, 4) and Check-out (1, 5) status codes
         for (const scan of validScans) {
            const t = scan.timestamp.getHours() + scan.timestamp.getMinutes()/60;
            const isCheckIn = scan.status === 0 || scan.status === 4 || scan.status === undefined; // default to checkin if undefined
            const isCheckOut = scan.status === 1 || scan.status === 5;
            
            if (isCheckIn) {
                if (t < 12) {
                    if (!amIn) amIn = scan.timestamp;
                } else {
                    if (!pmIn) pmIn = scan.timestamp;
                }
            } else if (isCheckOut) {
                if (t < 13.5) { // up to 1:30 PM is amOut
                    if (!amOut) amOut = scan.timestamp;
                } else {
                    pmOut = scan.timestamp; // Allow overwrite for latest pmOut
                }
            }
         }
      } else {
          // Fallback to strict time-based heuristics if no status is available
          if (validScans.length === 4) {
             amIn = validScans[0].timestamp;
             amOut = validScans[1].timestamp;
             pmIn = validScans[2].timestamp;
             pmOut = validScans[3].timestamp;
          } else if (validScans.length === 2) {
             const t0 = validScans[0].timestamp.getHours() + validScans[0].timestamp.getMinutes() / 60;
             const t1 = validScans[1].timestamp.getHours() + validScans[1].timestamp.getMinutes() / 60;
             if (t0 < 12 && t1 >= 12) {
                 amIn = validScans[0].timestamp;
                 pmOut = validScans[1].timestamp;
             } else if (t0 < 12 && t1 < 12) {
                 amIn = validScans[0].timestamp;
                 amOut = validScans[1].timestamp;
             } else {
                 pmIn = validScans[0].timestamp;
                 pmOut = validScans[1].timestamp;
             }
          } else {
             for (const scan of validScans) {
                 const t = scan.timestamp.getHours() + scan.timestamp.getMinutes()/60;
                 if (t < 11) {
                     if (!amIn) amIn = scan.timestamp;
                 } else if (t >= 11 && t < 13) {
                     if (!amOut) amOut = scan.timestamp;
                     else if (!pmIn) pmIn = scan.timestamp;
                 } else if (t >= 13 && t < 15) {
                     if (!pmIn) pmIn = scan.timestamp;
                     else if (!amOut && t < 13.5) amOut = scan.timestamp; 
                 } else {
                     pmOut = scan.timestamp; // Keep updating to the latest scan for PM Out
                 }
             }
          }
      }`
);

fs.writeFileSync('src/utils/excelParser.ts', code);
