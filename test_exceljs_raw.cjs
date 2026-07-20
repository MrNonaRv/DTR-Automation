const ExcelJS = require('exceljs');
const xlsx = require('xlsx');

process.env.TZ = 'Asia/Manila';

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  const d = new Date(2023, 0, 1, 8, 30, 0); // Local time in Manila -> UTC 00:30:00
  ws.addRow([1, d]);
  const buf = await wb.xlsx.writeBuffer();
  
  const readWb = xlsx.read(buf, { type: 'buffer' });
  const readWs = readWb.Sheets['Sheet1'];
  const json = xlsx.utils.sheet_to_json(readWs, { header: 1, raw: true });
  console.log('original Date local:', d.toString());
  console.log('raw Excel float:', json[0][1]);
}
test();
