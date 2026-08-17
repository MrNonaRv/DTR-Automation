const ExcelJS = require('exceljs');
async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet 1');
  const d = new Date(2026, 7, 17, 8, 0, 0); 
  ws.addRow([1, d]);
  await wb.xlsx.writeFile('test2.xlsx');
  
  const fs = require('fs');
  const AdmZip = require('adm-zip'); // Actually wait, xlsx handles it.
}
test();
