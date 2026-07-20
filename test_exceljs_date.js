import ExcelJS from 'exceljs';
import * as xlsx from 'xlsx';

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  const d = new Date(2023, 0, 1, 8, 30, 0); // Local time
  ws.addRow([1, d]);
  const buf = await wb.xlsx.writeBuffer();
  
  const readWb = xlsx.read(buf, { type: 'buffer', cellDates: true });
  const readWs = readWb.Sheets['Sheet1'];
  const json = xlsx.utils.sheet_to_json(readWs, { header: 1 });
  console.log('original Date local:', d.toString());
  console.log('original Date UTC:', d.toISOString());
  console.log('read Date UTC:', json[0][1].toISOString());
}
test();
