const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

content = content.replace(/const doc = new PDFDocument\(\{\n        size: "A4",\n        margin: 20,\n      \}\);\n      doc\.initForm\(\);\n\/\/\s+size: "A4",\n        margin: 20,\n      \}\);\n      doc\.initForm\(\);\n\/\/\s+size: "A4",\n        margin: 20,\n      \}\);/g, 'const doc = new PDFDocument({ size: "A4", margin: 20 });\n      doc.initForm();');

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
