const fs = require('fs');

let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const regex1 = /const parseDateTimeString = \(s: string\) => \{[\s\S]*?\};\n\n  const parseDatText = \(text: string\) => \{[\s\S]*?\};/m;

const newCode = `const parseDateTimeString = (s: string) => {
    const m = String(s).match(/^(\\d{4})-(\\d{2})-(\\d{2})[ T](\\d{2}):(\\d{2}):(\\d{2})/);
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
    return new Date(y, mo - 1, d, h, mi, se);
  };

  const parseDatText = (text: string) => {
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      const parts = line.split('\\t');
      if (parts.length < 2) continue;
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1].trim());
      if (!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  };`;

content = content.replace(regex1, newCode);
fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Replaced successfully');
