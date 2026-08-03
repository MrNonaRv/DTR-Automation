const fs = require('fs');

let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace(/export const config = [\s\S]*?;\n/g, "");

content += "\nexport const config = {\n  api: {\n    bodyParser: false,\n  },\n};\n";

fs.writeFileSync('api/index.ts', content);
console.log('Fixed api/index.ts config');
