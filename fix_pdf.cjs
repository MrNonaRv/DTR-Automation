const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

// remove the broken function timeStr { ... } entirely
content = content.replace(/function timeStr \{[\s\S]*?return timeStr;\n\}\n/g, '');

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
