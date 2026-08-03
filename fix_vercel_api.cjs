const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

if (!content.includes('export const config')) {
  content = content + "\n\nexport const config = {\n  api: {\n    bodyParser: false,\n  },\n};\n";
  fs.writeFileSync('api/index.ts', content);
  console.log('Added config to api/index.ts');
} else {
  console.log('Config already present');
}
