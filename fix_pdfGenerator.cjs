const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');
content = content.replace(/function drawDTR\(/g, "const drawDTR = (");
content = content.replace(/const drawDTR = \((.*?)\) \{/g, "const drawDTR = ($1) => {");
fs.writeFileSync('src/utils/pdfGenerator.ts', content);
console.log('Fixed pdfGenerator.ts');
