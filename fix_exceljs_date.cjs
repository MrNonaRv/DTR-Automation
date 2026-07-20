const fs = require('fs');

let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const regex = /const row = ws\.addRow\(\[rec\.userId, rec\.dt\]\);/g;
content = content.replace(regex, `const offsetDate = new Date(rec.dt.getTime() - rec.dt.getTimezoneOffset() * 60000);
        const row = ws.addRow([rec.userId, offsetDate]);`);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed offsetDate');
