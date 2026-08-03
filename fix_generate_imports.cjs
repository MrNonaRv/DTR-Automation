const fs = require('fs');

let dtrContent = fs.readFileSync('api/generate-dtr.ts', 'utf8');
dtrContent = dtrContent.replace(
  "import type { VercelRequest, VercelResponse } from '@vercel/node';",
  "import type { VercelRequest, VercelResponse } from '@vercel/node';\nimport { generateDTR } from '../src/utils/pdfGenerator';"
);
dtrContent = dtrContent.replace("const { generateDTR } = await import('../src/utils/pdfGenerator');\n    ", "");
fs.writeFileSync('api/generate-dtr.ts', dtrContent);

let allDtrsContent = fs.readFileSync('api/generate-all-dtrs.ts', 'utf8');
allDtrsContent = allDtrsContent.replace(
  "import type { VercelRequest, VercelResponse } from '@vercel/node';",
  "import type { VercelRequest, VercelResponse } from '@vercel/node';\nimport { generateAllDTRs } from '../src/utils/pdfGenerator';"
);
allDtrsContent = allDtrsContent.replace("const { generateAllDTRs } = await import('../src/utils/pdfGenerator');\n    ", "");
fs.writeFileSync('api/generate-all-dtrs.ts', allDtrsContent);

console.log('Fixed dynamic imports!');
