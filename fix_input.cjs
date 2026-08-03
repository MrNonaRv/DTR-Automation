const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(
  "onChange={e => { if (e.target.files?.length) handleFile(e.target.files[0]) }}",
  "onChange={e => { if (e.target.files?.length) { handleFile(e.target.files[0]); e.target.value = ''; } }}"
);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed file input onChange');
