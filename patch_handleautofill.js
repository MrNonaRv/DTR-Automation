const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    if (autoFillUsers.trim().toLowerCase() === 'all') {`;
const replace = `    if (autoFillUsers.trim().toLowerCase() === 'all' || autoFillUsers.trim() === '') {`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched handleAutoFill blank input");
} else {
  console.log("Could not find handleAutoFill search string");
}
