const fs = require('fs');

let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');
code = code.replace(
  /const name = getCellStr\(row\.getCell\(2\)\)\.trim\(\);/g,
  "const name = getCellStr(row.getCell(2)).trim().toUpperCase();"
);
fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched scanner import");
