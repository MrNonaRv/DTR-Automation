const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(
  "appendLog('Error: ' + err.message, 'warn');\n      console.error(err);",
  "appendLog('Error: ' + err.message, 'warn');\n      setToast({ message: err.message, type: 'error' });\n      console.error(err);"
);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed ScannerTool.tsx toasts');
