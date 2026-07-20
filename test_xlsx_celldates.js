import * as xlsx from 'xlsx';
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet([
  ['ID', 'Time'],
  [1, 45100.354166666664] // Face value: 2023-06-23 08:30:00
]);
xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

const readWb = xlsx.read(buf, { type: 'buffer', cellDates: true });
const readWs = readWb.Sheets['Sheet1'];
const json = xlsx.utils.sheet_to_json(readWs, { header: 1 });
console.log('val:', json[1][1]);
console.log('UTC hours:', json[1][1].getUTCHours());
