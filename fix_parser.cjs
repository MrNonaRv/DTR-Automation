const fs = require('fs');
let content = fs.readFileSync('src/utils/excelParser.ts', 'utf8');

// replace HH:mm with h:mm a
content = content.replace(/format\(amIn, "HH:mm"\)/g, 'format(amIn, "h:mm a")');
content = content.replace(/format\(amOut, "HH:mm"\)/g, 'format(amOut, "h:mm a")');
content = content.replace(/format\(pmIn, "HH:mm"\)/g, 'format(pmIn, "h:mm a")');
content = content.replace(/format\(pmOut, "HH:mm"\)/g, 'format(pmOut, "h:mm a")');

fs.writeFileSync('src/utils/excelParser.ts', content);
