const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/autoFillRule/g, 'autoFillSchedule');
code = code.replace(/setAutoFillRule/g, 'setAutoFillSchedule');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed autoFillRule to autoFillSchedule!");
