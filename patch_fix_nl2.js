const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

code = code.replace(
  "onDownload: (employee: EmployeeAttendance) => void;\\n  autoFillTrigger?: number;",
  "onDownload: (employee: EmployeeAttendance) => void;\n  autoFillTrigger?: number;"
);

fs.writeFileSync('src/components/DTREditor.tsx', code);
