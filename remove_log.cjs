const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace(
  "console.log('req.body:', typeof req.body === 'string' ? req.body.substring(0, 100) : Object.keys(req.body));",
  ""
);
fs.writeFileSync('api/index.ts', content);
console.log('Removed console.log');
