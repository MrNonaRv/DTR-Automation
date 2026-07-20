import ExcelJS from 'exceljs';
import * as xlsx from 'xlsx';

process.env.TZ = 'Asia/Manila';

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  const d = new Date(2023, 0, 1, 8, 30, 0); // Local time in Manila (UTC+8) -> UTC 00:30:00
  const offsetDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  ws.addRow([1, offsetDate]);
  const buf = await wb.xlsx.writeBuffer();
  
  const readWb = xlsx.read(buf, { type: 'buffer', cellDates: true });
  const readWs = readWb.Sheets['Sheet1'];
  const json = xlsx.utils.sheet_to_json(readWs, { header: 1 });
  console.log('original Date local:', d.toString());
  console.log('read Date UTC:', json[0][1].toISOString());
}
test();
