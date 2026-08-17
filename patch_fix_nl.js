const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "employee={parsedData[currentIndex]}\\n                  autoFillTrigger={autoFillTrigger}",
  "employee={parsedData[currentIndex]}\n                  autoFillTrigger={autoFillTrigger}"
);

fs.writeFileSync('src/App.tsx', code);
