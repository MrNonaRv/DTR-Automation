const assert = require('assert');

const parseDateTimeString = (s) => {
  const m = String(s).match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})[ T](\d{1,2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
  return new Date(y, mo - 1, d, h, mi, se);
};

const parseDatText = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const records = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) continue;
    const userId = parseInt(parts[0], 10);
    const dt = parseDateTimeString(parts[1] + ' ' + parts[2]);
    if (!isNaN(userId) && dt) records.push({ userId, dt });
  }
  return records;
};

// ZKTeco standard formats
const text1 = "1\t2023-01-01\t08:00:00\t1\t1";
const text2 = "2 2023-01-01 12:30:00 1 1";
const text3 = " 3  2023/02/01   09:15:30  ";

const r1 = parseDatText(text1);
console.log("R1:", r1);

const r2 = parseDatText(text2);
console.log("R2:", r2);

const r3 = parseDatText(text3);
console.log("R3:", r3);
