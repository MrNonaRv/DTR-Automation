const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace("from '../src/utils/excelParser'", "from '../src/utils/excelParser.js'");
content = content.replace("from '../src/utils/pdfGenerator'", "from '../src/utils/pdfGenerator.js'");
fs.writeFileSync('api/index.ts', content);
console.log('Fixed api/index.ts');
