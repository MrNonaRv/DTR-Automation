const fs = require('fs');
let code = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

code = code.replace(
  `const validScans: Date[] = [];`,
  `const validScans: { timestamp: Date, status?: number }[] = [];`
);

code = code.replace(
  `if (scan.getTime() - lastScan.getTime() > 60000)`,
  `if (scan.timestamp.getTime() - lastScan.timestamp.getTime() > 60000)`
);

code = code.replace(
  `const validScans: { timestamp: Date, status?: number }[] = [];
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
  `const validScans: { timestamp: Date, status?: number }[] = [];
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

fs.writeFileSync('src/utils/excelParser.ts', code);
