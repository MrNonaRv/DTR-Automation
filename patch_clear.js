const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'setParsedData(null); setFile(null); setShowEditor(false);',
  'setParsedData(null); setFile(null); setShowEditor(false); setCurrentSessionId(null); setCurrentSessionName("");'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched clear");
