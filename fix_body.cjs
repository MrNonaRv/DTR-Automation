const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

content = content.replace(
  "if (req.body && Object.keys(req.body).length > 0) {",
  "if (req.body !== undefined) {"
);
content = content.replace(
  "if (req.body && Object.keys(req.body).length > 0) {",
  "if (req.body !== undefined) {"
);

// We need to add the config block back to api/index.ts for Vercel, to increase the limit just in case!
const configBlock = "\nexport const config = {\n  api: {\n    bodyParser: {\n      sizeLimit: '10mb',\n    },\n  },\n};\n";
if (!content.includes('export const config')) {
  content += configBlock;
}

fs.writeFileSync('api/index.ts', content);
console.log('Fixed req.body check in api/index.ts');
