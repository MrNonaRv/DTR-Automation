import * as xlsx from 'xlsx';
import { format } from 'date-fns';

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet([
  ['ID', 'Time'],
  [1, new Date(2023, 0, 1, 8, 30, 0)] // Jan 1 2023 08:30:00 Local
]);
xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

const readWb = xlsx.read(buf, { type: 'buffer', cellDates: true });
const readWs = readWb.Sheets['Sheet1'];
const json = xlsx.utils.sheet_to_json(readWs, { header: 1 });
console.log('cellDates: true ->', json[1][1], typeof json[1][1], json[1][1] instanceof Date);
console.log('cellDates: true getHours() ->', json[1][1].getHours(), json[1][1].getUTCHours());

const readWb2 = xlsx.read(buf, { type: 'buffer' });
const json2 = xlsx.utils.sheet_to_json(readWb2.Sheets['Sheet1'], { header: 1, raw: false });
console.log('raw: false ->', json2[1][1]);
