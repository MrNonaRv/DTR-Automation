const fs = require('fs');
const ExcelJS = require('exceljs');
const xlsx = require('xlsx');

// Mock data and parsing
const text = fs.readFileSync('test_data.txt', 'utf8');

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
    const parts = line.split('\t');
    if (parts.length < 2) continue;
    const userId = parseInt(parts[0], 10);
    const dt = parseDateTimeString(parts[1].trim());
    if (!isNaN(userId) && dt) records.push({ userId, dt });
  }
  return records;
};

async function buildWorkbookFromSpec(spec) {
  const wb = new ExcelJS.Workbook();
  const usedNames = new Set();
  for (const item of spec) {
    let finalName = item.sheetName;
    const ws = wb.addWorksheet(finalName);
    item.records.forEach(rec => {
      // The user's current code uses rec.dt directly
      const row = ws.addRow([rec.userId, rec.dt]);
      const c1 = row.getCell(1), c2 = row.getCell(2);
      c2.numFmt = 'm/d/yyyy h:mm AM/PM';
    });
  }
  return wb.xlsx.writeBuffer();
}

async function run() {
  process.env.TZ = 'Asia/Manila';
  const records = parseDatText(text);
  const spec = [{ sheetName: 'Sheet1', records }];
  const buffer = await buildWorkbookFromSpec(spec);
  
  const readWb = xlsx.read(buffer, { type: 'buffer' });
  const readWs = readWb.Sheets['Sheet1'];
  const json = xlsx.utils.sheet_to_json(readWs, { header: 1, raw: true });
  
  // original date
  const origDate = records[0].dt;
  console.log('Parsed Local Date:', origDate.toString());
  
  // face value float in excel
  const rawFloat = json[0][1];
  const utc = new Date(Math.round((rawFloat - 25569) * 86400 * 1000));
  console.log('Face value written to Excel:', utc.toISOString().replace('T', ' ').replace('.000Z', ''));
}
run();
