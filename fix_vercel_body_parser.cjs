const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');

// Remove the config block
content = content.replace(/export const config = \{\s*api: \{\s*bodyParser: false,?\s*\},\s*\};\s*/g, "");

fs.writeFileSync('api/index.ts', content);
console.log('Removed config block from api/index.ts');
