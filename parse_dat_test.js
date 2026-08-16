const parseDateTimeString = (s) => {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
  return new Date(y, mo - 1, d, h, mi, se);
};

const parseDatText = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const records = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) continue; // userId, date, time
    const userId = parseInt(parts[0], 10);
    const dt = parseDateTimeString(parts[1] + ' ' + parts[2]);
    if (!isNaN(userId) && dt) records.push({ userId, dt });
  }
  return records;
};

const sample1 = "1\t2026-07-01 08:30:00\t1\t1\t0\t0";
const sample2 = "  2    2026-07-01 09:30:00  1 1 0 0";
console.log(parseDatText(sample1));
console.log(parseDatText(sample2));
