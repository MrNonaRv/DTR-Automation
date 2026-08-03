const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "alert(`Error generating PDF: ${err.message}`);",
  "setToast({ message: `Error generating PDF: ${err.message}`, type: 'error' });"
);

content = content.replace(
  "alert(`Error generating PDFs: ${err.message}`);",
  "setToast({ message: `Error generating PDFs: ${err.message}`, type: 'error' });"
);

content = content.replace(
  "setError(err.message || 'An error occurred during upload.');",
  "setError(err.message || 'An error occurred during upload.');\n      setToast({ message: err.message || 'An error occurred during upload.', type: 'error' });"
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx toasts');
