const fs = require('fs');
let code = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

const search = `      if (valB instanceof Date) {
        // xlsx cellDates: true returns UTC dates where the UTC time is the face value time.
        // Shift it to local time so that getHours() returns the face value hour
        dateObj = new Date(valB.getUTCFullYear(), valB.getUTCMonth(), valB.getUTCDate(), valB.getUTCHours(), valB.getUTCMinutes(), valB.getUTCSeconds());
      } else if (typeof valB === 'number') {`;

const replace = `      if (valB instanceof Date) {
        // xlsx with cellDates: true returns a JS Date where the *local time* represents the face value.
        // So valB.getHours() will correctly yield the face value hour regardless of timezone.
        dateObj = valB;
      } else if (typeof valB === 'number') {`;

code = code.replace(search, replace);

fs.writeFileSync('src/utils/excelParser.ts', code);
console.log("Patched excelParser.ts");
