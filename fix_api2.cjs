const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace(/from '\.\.\/src\/utils\/excelParser\.js'/g, "from '../src/utils/excelParser'");
content = content.replace(/from '\.\.\/src\/utils\/pdfGenerator\.js'/g, "from '../src/utils/pdfGenerator'");
fs.writeFileSync('api/index.ts', content);
console.log('Fixed api/index.ts');
