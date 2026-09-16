const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const handleReset = () => {\\n    setFile(null);\\n    setParsedData(null);\\n    setError(null);\\n    setCurrentIndex(0);\\n  };',
  'const handleReset = () => {\\n    setFile(null);\\n    setParsedData(null);\\n    setError(null);\\n    setCurrentIndex(0);\\n    setCurrentSessionId(null);\\n    setCurrentSessionName("");\\n  };'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched reset");
