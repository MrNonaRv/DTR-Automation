import { parseBiometricLogs } from './src/utils/excelParser';
import fs from 'fs';

// create a dummy xlsx to test
import * as xlsx from 'xlsx';
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet([['ID', 'Datetime'], ['1', new Date()]]);
xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
const buf = xlsx.write(wb, { type: 'buffer' });

try {
  parseBiometricLogs(buf);
  console.log("parseBiometricLogs successful");
} catch (e) {
  console.error(e);
}
