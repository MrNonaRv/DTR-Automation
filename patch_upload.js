const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "      setParsedData(formattedData);\n      \n      setToast({ message: 'DTR Data uploaded successfully.', type: 'success' });",
  "      setCurrentSessionId(null);\n      setCurrentSessionName(`DTR Session - ${new Date().toLocaleDateString()}`);\n      setParsedData(formattedData);\n      \n      setToast({ message: 'DTR Data uploaded successfully.', type: 'success' });"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for handleUpload');
