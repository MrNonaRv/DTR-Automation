const ExcelJS = require('exceljs');

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet 1');
  
  // Create a local Date for 8:00 AM
  const localDate = new Date(2026, 7, 17, 8, 0, 0); 
  console.log("Local Date:", localDate.toString());
  console.log("Local Date UTC:", localDate.toUTCString());

  ws.addRow([1, localDate]);
  
  // Offset date 
  const offsetDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
  ws.addRow([2, offsetDate]);
  
  await wb.xlsx.writeFile('test.xlsx');
  console.log("Wrote test.xlsx");
}

test();
