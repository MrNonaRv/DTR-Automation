const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(/import\("\.\/src\/utils\/pdfGenerator\.js"\)/g, 'import("./src/utils/pdfGenerator")');
fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts');
