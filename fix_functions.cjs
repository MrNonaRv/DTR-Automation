const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const oldCode = `  const parseDateTimeString = (s: string) => {
    // Try to rely on JS built-in parsing first if it's standard, but ensure we handle custom formats correctly.
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;

    let m = String(s).match(/^(\\d{4})[-\\/](\\d{1,2})[-\\/](\\d{1,2})[ T](\\d{1,2}):(\\d{2}):(\\d{2})(?:\\s*(AM|PM|am|pm))?/);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3], mi = +m[5], se = +m[6];
      let h = +m[4];
      const ampm = m[7] ? m[7].toUpperCase() : null;
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return new Date(y, mo - 1, d, h, mi, se);
    }
    m = String(s).match(/^(\\d{1,2})[-\\/](\\d{1,2})[-\\/](\\d{4})[ T](\\d{1,2}):(\\d{2}):(\\d{2})(?:\\s*(AM|PM|am|pm))?/);
    if (m) {
      const y = +m[3];
      let mo = +m[1];
      let d = +m[2];
      if (mo > 12) {
        d = +m[1];
        mo = +m[2];
      }
      let h = +m[4];
      const mi = +m[5], se = +m[6];
      const ampm = m[7] ? m[7].toUpperCase() : null;
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return new Date(y, mo - 1, d, h, mi, se);
    }
    return null;
  };

  const parseDatText = (text: string) => {
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      const parts = line.trim().split(/\\s+/);
      if (parts.length < 3) continue;
      const userId = parseInt(parts[0], 10);
      
      // Sometimes it's ID DATE TIME AM/PM ...
      // Or ID DATE TIME ...
      let dtString = parts[1] + ' ' + parts[2];
      if (parts.length > 3 && (parts[3].toUpperCase() === 'AM' || parts[3].toUpperCase() === 'PM')) {
         dtString += ' ' + parts[3];
      }
      const dt = parseDateTimeString(dtString);
      if (!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  };`;

const newCode = `  const parseDateTimeString = (s: string) => {
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

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed');
