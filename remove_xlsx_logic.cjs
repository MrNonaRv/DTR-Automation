const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(
  "} else if (lower.endsWith('.xlsx')) {\n        const buf = await uploadedFile.arrayBuffer();\n        const result = await parsePerUserWorkbook(buf);\n        if (result.spec.length === 0) throw new Error('No per-user sheets with UserID/DateTime found in this workbook.');\n        spec = result.spec;\n        appendLog(`Read ${result.totalPunches} punches across ${spec.length} existing sheets.`, 'ok');\n        appendLog('Sheet names kept as-is — no re-matching against the roster.', 'ok');\n      } else {",
  "} else {"
);

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Removed xlsx conversion logic');
