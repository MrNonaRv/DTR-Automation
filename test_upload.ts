import { parseBiometricLogs } from './src/utils/excelParser';
import * as xlsx from 'xlsx';

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet([['ID', 'Datetime'], ['User1', new Date()]]);
xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
const buf = xlsx.write(wb, { type: 'buffer' });
const fileBase64 = buf.toString('base64');

fetch('http://localhost:3000/api/upload-attendance', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ fileData: fileBase64 })
}).then(res => res.json()).then(data => {
  console.log(data);
}).catch(console.error);
