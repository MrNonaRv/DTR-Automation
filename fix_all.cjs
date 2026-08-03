const fs = require('fs');

const files = ['api/upload-attendance.ts', 'api/generate-dtr.ts', 'api/generate-all-dtrs.ts'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from '\.\.\/src\/utils\/excelParser'/g, "from '../src/utils/excelParser.js'");
  content = content.replace(/from '\.\.\/src\/utils\/pdfGenerator'/g, "from '../src/utils/pdfGenerator.js'");
  fs.writeFileSync(file, content);
}

// also fix pdfGenerator's internal import
let pdfContent = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');
pdfContent = pdfContent.replace(/from "\.\/excelParser"/g, "from './excelParser.js'");
fs.writeFileSync('src/utils/pdfGenerator.ts', pdfContent);

console.log('Fixed imports for ESM!');
