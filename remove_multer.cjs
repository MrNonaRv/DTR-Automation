const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace("import multer from 'multer';", "");
content = content.replace("const upload = multer({ storage: multer.memoryStorage() });", "");
fs.writeFileSync('api/index.ts', content);
console.log('Removed multer');
