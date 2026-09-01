const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

code = code.replace(/for \(let i = 1; i <= 31; i\+\+\) \{/g, "for (let i = dataStartDay; i <= dataEndDay; i++) {");

fs.writeFileSync('src/utils/pdfGenerator.ts', code);
console.log("Patched PDF loop again!");
