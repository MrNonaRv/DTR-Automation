const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

// Replace all occurrences of doc initialization mess
content = content.replace(/const doc = new PDFDocument\(\{[\s\S]*?margin: 20,\n      \}\);/g, 'const doc = new PDFDocument({ size: "A4", margin: 20 });\n      doc.initForm();');

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
