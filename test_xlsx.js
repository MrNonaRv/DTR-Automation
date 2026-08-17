const xlsx = require('xlsx');

const workbook = xlsx.readFile('test.xlsx', { cellDates: true });
const ws = workbook.Sheets['Sheet 1'];
const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });

console.log(rawData);
