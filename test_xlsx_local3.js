const xlsx = require('xlsx');
const workbook = xlsx.readFile('test.xlsx', { cellDates: true });
console.log(workbook.Sheets['Sheet 1']['B2'].v.getUTCHours());
