const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(
  "onClick={() => setSelectedScanner(key)}",
  "onClick={() => { if (selectedScanner !== key) { setSelectedScanner(key); setUploadedFile(null); setBuiltWorkbookBuffer(null); setLogs([]); } }}"
);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed scanner select in convert tab');
