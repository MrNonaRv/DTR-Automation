const fs = require('fs');
let code = fs.readFileSync('src/utils/excelParser.ts', 'utf8');
code = code.replace(
  "export interface EmployeeAttendance {\\n  id?: string;\\n  employeeIdOrName: string;\\n  records: AttendanceRecord[];\\n  createdAt?: any;\\n}",
  "export interface EmployeeAttendance {\\n  id?: string;\\n  employeeIdOrName: string;\\n  empNo?: number | string;\\n  records: AttendanceRecord[];\\n  createdAt?: any;\\n}"
);
fs.writeFileSync('src/utils/excelParser.ts', code);
console.log("Patched EmployeeAttendance interface");
