const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /match\(\/\^\(\\d\{4\}\)-\(\\d\{2\}\)-\(\\d\{2\}\)\[ T\]\(\\d\{2\}\):\(\\d\{2\}\):\(\\d\{2\}\)\/\)/g,
    "match(/^(\\d{4})[-\\\\/](\\d{1,2})[-\\\\/](\\d{1,2})[ T](\\d{1,2}):(\\d{2}):(\\d{2})/)"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed dates', filePath);
}

fixFile('src/components/ScannerTool.tsx');
fixFile('public/scanner.html');
