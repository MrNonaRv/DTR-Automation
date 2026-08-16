const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

code = code.replace(
  `      const processNext = async () => {
        for (let i = 0; i < employees.length; i += 2) {
          await new Promise(resolve => setImmediate(resolve));`,
  `      for (let i = 0; i < employees.length; i += 2) {`
);
fs.writeFileSync('src/utils/pdfGenerator.ts', code);
