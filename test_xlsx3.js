const xlsx = require('xlsx');
const workbook = xlsx.readFile('test.xlsx');
const ws = workbook.Sheets['Sheet 1'];
console.log(ws['B1'].v, ws['B2'].v);
