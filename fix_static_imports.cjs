const fs = require('fs');

let content = fs.readFileSync('api/index.ts', 'utf8');

// Add static import back
content = "import { generateDTR, generateAllDTRs } from '../src/utils/pdfGenerator';\n" + content;

// Remove dynamic imports
content = content.replace("const { generateDTR } = await import('../src/utils/pdfGenerator');", "");
content = content.replace("const { generateAllDTRs } = await import('../src/utils/pdfGenerator');", "");

fs.writeFileSync('api/index.ts', content);
console.log('Fixed static imports in api/index.ts');
