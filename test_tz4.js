import ExcelJS from 'exceljs';
import * as xlsx from 'xlsx';

process.env.TZ = 'UTC';

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  const d = new Date(2023, 0, 1, 8, 30, 0); 
  ws.addRow([1, d]);
  const buf = await wb.xlsx.writeBuffer();
  
  const readWb = xlsx.read(buf, { type: 'buffer', cellDates: true });
  console.log(readWb.Sheets['Sheet1']['B1'].v.toISOString());
}
test();
