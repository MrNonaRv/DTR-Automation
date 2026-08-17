const xlsx = require('xlsx');
const workbook = xlsx.readFile('test.xlsx', { cellDates: true });
const ws = workbook.Sheets['Sheet 1'];
console.log(workbook.Sheets['Sheet 1']['B2'].v); // The Date object
