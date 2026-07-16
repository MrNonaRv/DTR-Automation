const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

// There are two functions: generateDTR and generateAllDTRs
// Let's just fix them manually by finding 'Promise<Buffer> {' and 'const buffers'

content = content.replace(/try \{[\s\S]*?const buffers: Buffer\[\] = \[\];/g, `try {
      const doc = new PDFDocument({ size: "A4", margin: 20 });
      doc.initForm();
      const buffers: Buffer[] = [];`);

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
