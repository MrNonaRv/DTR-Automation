const fs = require('fs');
let content = fs.readFileSync('src/utils/pdfGenerator.ts', 'utf8');

const timeHelper = `
function formatTo12Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return timeStr || "";
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    if (!isNaN(h)) {
      h = h % 12;
      if (h === 0) h = 12;
      const paddedH = h.toString().padStart(2, '0');
      return \`\${paddedH}:\${m}\`;
    }
  }
  return timeStr;
}
`;

// Insert the helper at the top, after imports
content = content.replace(/import \{ AttendanceRecord \} from "\.\/excelParser";/, 'import { AttendanceRecord } from "./excelParser";\n' + timeHelper);

// Replace amInVal, amOutVal etc in generateDTR
content = content.replace(/const amInVal = \(record && isDateInRange && record\.amIn\) \? record\.amIn : "";/g, 'const amInVal = (record && isDateInRange && record.amIn) ? formatTo12Hour(record.amIn) : "";');
content = content.replace(/const amOutVal = \(record && isDateInRange && record\.amOut\) \? record\.amOut : "";/g, 'const amOutVal = (record && isDateInRange && record.amOut) ? formatTo12Hour(record.amOut) : "";');
content = content.replace(/const pmInVal = \(record && isDateInRange && record\.pmIn\) \? record\.pmIn : "";/g, 'const pmInVal = (record && isDateInRange && record.pmIn) ? formatTo12Hour(record.pmIn) : "";');
content = content.replace(/const pmOutVal = \(record && isDateInRange && record\.pmOut\) \? record\.pmOut : "";/g, 'const pmOutVal = (record && isDateInRange && record.pmOut) ? formatTo12Hour(record.pmOut) : "";');

fs.writeFileSync('src/utils/pdfGenerator.ts', content);
