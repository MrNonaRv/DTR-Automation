const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

code = code.replace(
  `  const parseDatText = (text: string) => {
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      // Handle both tab-separated and space-separated formats natively
      const match = line.trim().match(/^(\\d+)[\\s,]+(\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}[\\sT]+\\d{1,2}:\\d{2}:\\d{2})(.*)$/);
      if (match) {
        const userId = parseInt(match[1], 10);
        const dt = parseDateTimeString(match[2].replace(/[\\/]/g, '-').replace('T', ' '));
        let status = null;
        const rest = match[3] ? match[3].trim().split(/\\s+/) : [];
        if (rest.length >= 2) status = parseInt(rest[1], 10);
        if (!isNaN(userId) && dt) records.push({ userId, dt, status });
        continue;
      }
      // Fallback
      const parts = line.split('\\t');
      if (parts.length >= 2) {
        const userId = parseInt(parts[0], 10);
        const dt = parseDateTimeString(parts[1].trim());
        let status = null;
        if (parts.length >= 4) status = parseInt(parts[3], 10);
        if (!isNaN(userId) && dt) records.push({ userId, dt, status });
      }
    }
    return records;
  };`,
  `  const parseDatText = (text: string) => {
    const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      // Handle both tab-separated and space-separated formats natively
      const match = line.trim().match(/^(\\d+)[\\s,]+(\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}[\\sT]+\\d{1,2}:\\d{2}:\\d{2})/);
      if (match) {
        const userId = parseInt(match[1], 10);
        const dt = parseDateTimeString(match[2].replace(/[\\/]/g, '-').replace('T', ' '));
        if (!isNaN(userId) && dt) records.push({ userId, dt });
        continue;
      }
      // Fallback
      const parts = line.split('\\t');
      if (parts.length >= 2) {
        const userId = parseInt(parts[0], 10);
        const dt = parseDateTimeString(parts[1].trim());
        if (!isNaN(userId) && dt) records.push({ userId, dt });
      }
    }
    return records;
  };`
);

code = code.replace(
  `  const buildSpecFromDat = (records: any[], people: Person[]) => {
    const byUser = new Map();
    for (const r of records) {
      if (!byUser.has(r.userId)) byUser.set(r.userId, []);
      byUser.get(r.userId).push({ dt: r.dt, status: r.status });
    }

    const userIds = Array.from(byUser.keys()).sort((a, b) => a - b);
    let matched = 0, unmatched = 0;

    const spec = userIds.map(uidNum => {
      const punches = byUser.get(uidNum).slice().sort((a: any, b: any) => a.dt.getTime() - b.dt.getTime());
      
      const person = people.find(p => parseInt(p.empNo, 10) === uidNum);
      
      let name;
      if (person && person.name && person.name.trim()) { name = person.name.trim(); matched++; }
      else { name = \`User \${uidNum}\`; unmatched++; }

      return { sheetName: name, records: punches.map((p: any) => ({ userId: uidNum, dt: p.dt, status: p.status })) };
    });`,
  `  const buildSpecFromDat = (records: any[], people: Person[]) => {
    const byUser = new Map();
    for (const r of records) {
      if (!byUser.has(r.userId)) byUser.set(r.userId, []);
      byUser.get(r.userId).push(r.dt);
    }

    const userIds = Array.from(byUser.keys()).sort((a, b) => a - b);
    let matched = 0, unmatched = 0;

    const spec = userIds.map(uidNum => {
      const times = byUser.get(uidNum).slice().sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
      const person = people.find(p => parseInt(p.empNo, 10) === uidNum);
      
      let name;
      if (person && person.name && person.name.trim()) { name = person.name.trim(); matched++; }
      else { name = \`User \${uidNum}\`; unmatched++; }

      return { sheetName: name, records: times.map((dt: Date) => ({ userId: uidNum, dt })) };
    });`
);

code = code.replace(
  `      ws.columns = [{ width: 8 }, { width: 22 }, { width: 10 }];

      item.records.forEach((rec: any) => {
        let offsetDate: any = '';
        if (rec.dt && typeof rec.dt.getTime === 'function') {
          offsetDate = new Date(rec.dt.getTime() - rec.dt.getTimezoneOffset() * 60000);
        }
        const row = ws.addRow([rec.userId, offsetDate, rec.status !== null && rec.status !== undefined ? rec.status : '']);`,
  `      ws.columns = [{ width: 8 }, { width: 22 }];

      item.records.forEach((rec: any) => {
        let offsetDate: any = '';
        if (rec.dt && typeof rec.dt.getTime === 'function') {
          offsetDate = new Date(rec.dt.getTime() - rec.dt.getTimezoneOffset() * 60000);
        }
        const row = ws.addRow([rec.userId, offsetDate]);`
);

fs.writeFileSync('src/components/ScannerTool.tsx', code);
