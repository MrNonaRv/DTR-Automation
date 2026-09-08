const fs = require('fs');

let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');
code = code.replace(
  /onChange=\{e => updatePerson\(key, idx, 'name', e\.target\.value\)\}/g,
  "onChange={e => updatePerson(key, idx, 'name', e.target.value.toUpperCase())}"
);
fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched scanner");
