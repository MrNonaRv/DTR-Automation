const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(
  "if (!lower.endsWith('.dat') && !lower.endsWith('.xlsx')) {\n      setToast({ message: 'Please choose a .dat or .xlsx file', type: 'error' });",
  "if (!lower.endsWith('.dat')) {\n      setToast({ message: 'Please choose a .dat file', type: 'error' });"
);

content = content.replace(
  "Drop a .dat or .xlsx file here, or click to browse",
  "Drop a .dat file here, or click to browse"
);

content = content.replace(
  "Raw scanner export (.dat) or a previously-saved per-user workbook (.xlsx)",
  "Raw scanner export (.dat)"
);

content = content.replace(
  "accept=\".dat,.xlsx\"",
  "accept=\".dat\""
);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed ScannerTool.tsx to only allow .dat files');
