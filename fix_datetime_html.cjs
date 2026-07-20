const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the parseDateTimeString implementation entirely
  const oldFuncRegex = /function parseDateTimeString\([^\)]+\)\{[\s\S]*?return new Date[^}]+\}/;
  
  const newFunc = `function parseDateTimeString(s){
    let m = String(s).match(/^(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})[ T](\\d{1,2}):(\\d{2}):(\\d{2})/);
    if(m){
      const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
      return new Date(y, mo - 1, d, h, mi, se);
    }
    m = String(s).match(/^(\\d{1,2})[-\\/](\\d{1,2})[-\\/](\\d{4})[ T](\\d{1,2}):(\\d{2}):(\\d{2})/);
    if(m){
      const y = +m[3];
      let mo = +m[1];
      let d = +m[2];
      if(mo > 12){ d = +m[1]; mo = +m[2]; }
      const h = +m[4], mi = +m[5], se = +m[6];
      return new Date(y, mo - 1, d, h, mi, se);
    }
    const dt = new Date(s);
    if(!isNaN(dt.getTime())) return dt;
    return null;
  }`;

  if (filePath.endsWith('.html')) {
    content = content.replace(oldFuncRegex, newFunc);
  }

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile('public/scanner.html');
