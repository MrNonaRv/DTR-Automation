const ExcelJS = require('exceljs');
const fs = require('fs');

async function test() {
  process.env.TZ = 'Asia/Manila';
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  const d = new Date(2023, 0, 1, 8, 30, 0);
  ws.addRow([1, d]);
  await wb.xlsx.writeFile('test.xlsx');
}
test();
