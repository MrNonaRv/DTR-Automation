const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "import { UploadCloud,",
  "import { UploadCloud, Save,"
);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx imports!");
