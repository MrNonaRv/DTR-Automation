const fs = require('fs');
let content = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

const lines = content.split('\n');

const newLines = `      let amIn: Date | null = null;
      let amOut: Date | null = null;
      let pmIn: Date | null = null;
      let pmOut: Date | null = null;

      for (const scan of validScans) {
        const hour = scan.getHours();
        const timeVal = hour + scan.getMinutes() / 60;
        
        // AM IN (04:00 to 10:59)
        if (timeVal >= 4 && timeVal < 11) {
          if (!amIn) amIn = scan;
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
        } else {
          pmIn = midScans[0];
        }
      } else if (midScans.length >= 2) {
        amOut = midScans[0];
        pmIn = midScans[midScans.length - 1];
      }`;

// We want to replace lines 94 to 121
const before = lines.slice(0, 93);
const after = lines.slice(121);

const result = before.join('\n') + '\n' + newLines + '\n' + after.join('\n');
fs.writeFileSync('src/utils/excelParser.ts', result);
