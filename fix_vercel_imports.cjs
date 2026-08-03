const fs = require('fs');

for (const file of ['api/upload-attendance.ts', 'api/generate-dtr.ts', 'api/generate-all-dtrs.ts']) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from '\.\.\/src\/utils\/excelParser'/g, "from '../src/utils/excelParser.js'");
  content = content.replace(/import\('\.\.\/src\/utils\/pdfGenerator'\)/g, "import('../src/utils/pdfGenerator.js')");
  fs.writeFileSync(file, content);
}
console.log('Fixed imports in api/!');
