const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

const regex = /if \(record && i >= dataStartDay && i <= dataEndDay\) \{[\s\S]*?align: "center" \}\);\n          \}/g;

const replacement = `const isDateInRange = i >= dataStartDay && i <= dataEndDay;
          const amInVal = (record && isDateInRange && record.amIn) ? record.amIn : "";
          const amOutVal = (record && isDateInRange && record.amOut) ? record.amOut : "";
          const pmInVal = (record && isDateInRange && record.pmIn) ? record.pmIn : "";
          const pmOutVal = (record && isDateInRange && record.pmOut) ? record.pmOut : "";

          const safeEmpName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
          const fieldPrefix = \`\${safeEmpName}_\${startX}_day_\${i}\`;

          if (isDateInRange) {
            doc.formText(\`\${fieldPrefix}_amIn\`, cols[1], y + 1, colW[1], rowHeight - 2, { align: "center", value: amInVal });
            doc.formText(\`\${fieldPrefix}_amOut\`, cols[2], y + 1, colW[2], rowHeight - 2, { align: "center", value: amOutVal });
            doc.formText(\`\${fieldPrefix}_pmIn\`, cols[3], y + 1, colW[3], rowHeight - 2, { align: "center", value: pmInVal });
            doc.formText(\`\${fieldPrefix}_pmOut\`, cols[4], y + 1, colW[4], rowHeight - 2, { align: "center", value: pmOutVal });
          }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/utils/pdfGenerator.ts', content);
