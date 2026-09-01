const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                        placeholder="Type 'all' or '1-5'"`;
const replace = `                        placeholder="Blank = Current User. Or type 'all', '1-5'"`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched placeholder!");
} else {
  console.log("Could not find placeholder.");
}
