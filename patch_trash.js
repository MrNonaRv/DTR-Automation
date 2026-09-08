const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `setParsedData(null); setFile(null);`;
const replace = `setParsedData(null); setFile(null); setShowEditor(false);`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched trash button.");
} else {
  console.log("Not found.");
}
