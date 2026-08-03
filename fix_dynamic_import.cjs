const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

// Remove static import
content = content.replace("import { generateDTR, generateAllDTRs } from '../src/utils/pdfGenerator';", "");

// Add dynamic import to generate-dtr
content = content.replace(
  "const pdfBuffer = await generateDTR(employeeName, period || \"\", records, printRange);",
  "const { generateDTR } = await import('../src/utils/pdfGenerator');\n    const pdfBuffer = await generateDTR(employeeName, period || \"\", records, printRange);"
);

// Add dynamic import to generate-all-dtrs
content = content.replace(
  "const pdfBuffer = await generateAllDTRs(period || \"\", employees, printRange);",
  "const { generateAllDTRs } = await import('../src/utils/pdfGenerator');\n    const pdfBuffer = await generateAllDTRs(period || \"\", employees, printRange);"
);

fs.writeFileSync('api/index.ts', content);
console.log('Fixed dynamic imports');
