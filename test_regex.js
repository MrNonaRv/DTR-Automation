const parseDateTimeString = (s) => {
  const m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
  return new Date(y, mo - 1, d, h, mi, se);
};

const parseDatText = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const records = [];
  for (const line of lines) {
    const match = line.trim().match(/^(\d+)[\s,]+(\d{4}[-/]\d{1,2}[-/]\d{1,2}[\sT]+\d{1,2}:\d{2}:\d{2})/);
    if (match) {
      const userId = parseInt(match[1], 10);
      const dt = parseDateTimeString(match[2].replace(/[\/]/g, '-').replace('T', ' '));
      if (!isNaN(userId) && dt) records.push({ userId, dt });
      continue;
    }
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1].trim());
      if (!isNaN(userId) && dt) records.push({ userId, dt });
    }
  }
  return records;
};

const sample = `    123	2026-08-03 18:22:14	12	1	1	0
       67	2026-08-03 23:45:18	12	1	1	0
       89	2026-08-04 05:17:20	12	0	1	0`;

console.log(parseDatText(sample));
