const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "if (e.target.files && e.target.files.length > 0) {\n      setFile(e.target.files[0]);\n      setError(null);\n    }",
  "if (e.target.files && e.target.files.length > 0) {\n      setFile(e.target.files[0]);\n      setError(null);\n      e.target.value = '';\n    }"
);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx input');
