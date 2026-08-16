const parseDatText = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const records = [];
  for (const line of lines) {
    const match = line.trim().match(/^(\d+)[\s,]+(\d{4}[-/]\d{1,2}[-/]\d{1,2}[\sT]+\d{1,2}:\d{2}:\d{2})(.*)$/);
    if (match) {
      const userId = parseInt(match[1], 10);
      const dt = match[2];
      const rest = match[3] ? match[3].trim().split(/\s+/) : [];
      // usually: verifyMode, status, workCode, reserved
      let status = null;
      if (rest.length >= 2) {
        status = parseInt(rest[1], 10);
      }
      records.push({ userId, dt, status });
    }
  }
  return records;
};

const sample = `    123\t2026-08-03 18:22:14\t12\t1\t1\t0
       67\t2026-08-03 23:45:18\t12\t1\t1\t0
       89\t2026-08-04 05:17:20\t12\t0\t1\t0`;
       
console.log(parseDatText(sample));
