const fs = require('fs');
let code = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

// I am putting the UI back to exactly 31 rows, but keeping the "isDateInRange" logic so only the selected rows get data mapped into them. The previous modification was truncating the table, which isn't the standard Civil Service Form 48 format. It MUST have 31 rows printed.

code = code.replace(/for \(let i = dataStartDay; i <= dataEndDay; i\+\+\) \{/g, "for (let i = 1; i <= 31; i++) {");

fs.writeFileSync('src/utils/pdfGenerator.ts', code);
console.log("Reverted to 31 rows standard!");
