const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the parseDateTimeString implementation entirely
  const oldFuncRegex = /const parseDateTimeString = \([^\)]+\) => \{[\s\S]*?return new Date[^}]+\};/;
  
  const newFunc = `const parseDateTimeString = (s: string) => {
    let m = String(s).match(/^(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})[ T](\\d{1,2}):(\\d{2}):(\\d{2})/);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
      return new Date(y, mo - 1, d, h, mi, se);
    }
    m = String(s).match(/^(\\d{1,2})[-\\/](\\d{1,2})[-\\/](\\d{4})[ T](\\d{1,2}):(\\d{2}):(\\d{2})/);
    if (m) {
      // Assume MM/DD/YYYY if first part <= 12, but it's safer to just let JS parse it if we aren't sure.
      // Let's assume MM/DD/YYYY as it's common, or DD/MM/YYYY. 
      // ZKTeco is usually YYYY-MM-DD or MM/DD/YYYY or DD/MM/YYYY.
      // If we do y = m[3]
      const y = +m[3];
      let mo = +m[1];
      let d = +m[2];
      if (mo > 12) {
        // Must be DD/MM/YYYY
        d = +m[1];
        mo = +m[2];
      }
      const h = +m[4], mi = +m[5], se = +m[6];
      return new Date(y, mo - 1, d, h, mi, se);
    }
    // Fallback
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    return null;
  };`;

  if (filePath.endsWith('.tsx')) {
    content = content.replace(oldFuncRegex, newFunc);
  }

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile('src/components/ScannerTool.tsx');
