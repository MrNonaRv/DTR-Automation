const ExcelJS = require('exceljs');
const fs = require('fs');

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  const originalDate = new Date(2026, 6, 1, 8, 30, 0); // July 1, 2026 8:30 AM
  const offsetDate = new Date(originalDate.getTime() - originalDate.getTimezoneOffset() * 60000);
  
  ws.addRow([1, originalDate]);
  ws.addRow([2, offsetDate]);
  
  const c1 = ws.getCell('B1');
  const c2 = ws.getCell('B2');
  c1.numFmt = 'm/d/yyyy h:mm AM/PM';
  c2.numFmt = 'm/d/yyyy h:mm AM/PM';
  
  await wb.xlsx.writeFile('test.xlsx');
  console.log("Done");
}
test();
