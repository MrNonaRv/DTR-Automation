const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');
const match = code.match(/const buildSpecFromDat = [\s\S]*?return \{ spec, matched, unmatched, totalPunches: records\.length \};\s*\};/);
if (match) {
  console.log(match[0]);
} else {
  console.log("Not found");
}
