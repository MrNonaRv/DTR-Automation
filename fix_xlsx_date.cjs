const fs = require('fs');
let content = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

content = content.replace(
  /xlsx\.read\(fileBuffer, \{ type: "buffer" \}\);/g,
  'xlsx.read(fileBuffer, { type: "buffer", cellDates: true });'
);

content = content.replace(
  /if \(typeof valB === 'number'\) \{[\s\S]*?\} else if \(typeof valB === 'string'\) \{[\s\S]*?\}/,
  `if (valB instanceof Date) {
        dateObj = valB;
      } else if (typeof valB === 'number') {
        dateObj = new Date(Math.round((valB - 25569) * 86400 * 1000));
      } else if (typeof valB === 'string') {
        dateObj = new Date(valB);
      }`
);

fs.writeFileSync('src/utils/excelParser.ts', content);
console.log('Fixed');
