const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

content = content.replace(/doc\.initForm\(\);\n/g, '');

// First occurrence
content = content.replace(/doc\.formText\(`\$\{fieldPrefix\}_amIn`, cols\[1\], y \+ 1, colW\[1\], rowHeight - 2, \{ align: "center", value: amInVal \}\);/g, 
  'doc.text(amInVal, cols[1], y + 4, { width: colW[1], align: "center" });');
content = content.replace(/doc\.formText\(`\$\{fieldPrefix\}_amOut`, cols\[2\], y \+ 1, colW\[2\], rowHeight - 2, \{ align: "center", value: amOutVal \}\);/g, 
  'doc.text(amOutVal, cols[2], y + 4, { width: colW[2], align: "center" });');
content = content.replace(/doc\.formText\(`\$\{fieldPrefix\}_pmIn`, cols\[3\], y \+ 1, colW\[3\], rowHeight - 2, \{ align: "center", value: pmInVal \}\);/g, 
  'doc.text(pmInVal, cols[3], y + 4, { width: colW[3], align: "center" });');
content = content.replace(/doc\.formText\(`\$\{fieldPrefix\}_pmOut`, cols\[4\], y \+ 1, colW\[4\], rowHeight - 2, \{ align: "center", value: pmOutVal \}\);/g, 
  'doc.text(pmOutVal, cols[4], y + 4, { width: colW[4], align: "center" });');

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
