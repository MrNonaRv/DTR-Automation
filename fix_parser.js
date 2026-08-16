const fs = require('fs');
let code = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

code = code.replace(
  /const scans: \{ timestamp: Date \}\[\] = \[\];[\s\S]*?let valB = row\[1\]; \/\/ Datetime/,
  `const scans: { timestamp: Date, status?: number }[] = [];
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (row.length < 2) continue; // Skip incomplete rows
      const valA = row[0]; // ID / Name (usually same as sheetName, but can vary)
      let valB = row[1]; // Datetime
      let valC = row[2]; // Status (optional, from our improved converter)`
);

// We need to fix the fallback part where it says Date[] instead of { timestamp: Date, status?: number }[]
// specifically:
// const validScans: Date[] = [];
// This also failed! Let's check lines 60-150.
fs.writeFileSync('src/utils/excelParser.ts', code);
