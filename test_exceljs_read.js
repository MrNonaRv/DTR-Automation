const ExcelJS = require('exceljs');
async function test() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('test.xlsx');
  const ws = wb.worksheets[0];
  const d = ws.getCell('B2').value;
  console.log("Date object:", d);
  console.log("Local hours:", d.getHours());
  console.log("UTC hours:", d.getUTCHours());
}
test();
