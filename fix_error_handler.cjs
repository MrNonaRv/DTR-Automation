const fs = require('fs');
let content = fs.readFileSync('api/index.ts', 'utf8');
content = content.replace(
  "  if (err instanceof multer.MulterError) {\n    return res.status(400).json({ error: \"File upload error\", details: err.message });\n  }",
  ""
);
fs.writeFileSync('api/index.ts', content);
console.log('Fixed error handler');
