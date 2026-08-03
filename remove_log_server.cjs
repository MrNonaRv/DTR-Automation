const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  "console.log('req.body:', typeof req.body === 'string' ? req.body.substring(0, 100) : Object.keys(req.body));",
  ""
);
fs.writeFileSync('server.ts', content);
console.log('Removed console.log from server.ts');
