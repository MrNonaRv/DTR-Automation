const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const searchCode = `        if (!(dt instanceof Date)) {
          if (typeof dt === 'number') {
            // Handle Excel serial date
            dt = new Date(Math.round((dt - 25569) * 86400 * 1000));
          } else if (typeof dt === 'string') { 
            const parsed = new Date(dt); if (!isNaN(parsed.getTime())) dt = parsed; else return; 
          }
          else return;
        }`;

const replaceCode = `        if (dt instanceof Date) {
          // ExcelJS returns dates in UTC representing face value. Convert to local time face value.
          dt = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
        } else if (typeof dt === 'number') {
          // Handle Excel serial date
          const utcDate = new Date(Math.round((dt - 25569) * 86400 * 1000));
          dt = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds());
        } else if (typeof dt === 'string') { 
          const m = String(dt).match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})[ T](\\d{1,2}):(\\d{2}):(\\d{2})/);
          if (m) dt = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
          else {
            const parsed = new Date(dt); if (!isNaN(parsed.getTime())) dt = parsed; else return; 
          }
        }
        else return;`;

code = code.replace(searchCode, replaceCode);

fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched timezone in ScannerTool.tsx!");
