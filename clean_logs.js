const fs = require('fs');

function clean(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/console\.error\("Firestore batch error:", e\);/g, '');
  code = code.replace(/console\.error\(e\);/g, '');
  code = code.replace(/console\.error\('Storage error:', e\);/g, '');
  code = code.replace(/console\.error\("Failed to save recent files to firestore", err\);/g, '');
  code = code.replace(/console\.error\('Failed to save recent files to firestore', err\);/g, '');
  fs.writeFileSync(file, code);
}

clean('src/App.tsx');
clean('src/components/ScannerTool.tsx');
console.log("Cleaned");
