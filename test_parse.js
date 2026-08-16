const fs = require('fs');
const content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

// extract the parseDatText function string
const match = content.match(/const parseDatText = \(text: string\) => \{([\s\S]*?)return records;\s*\};/);
if (match) {
  const body = match[1];
  
  // mock parseDateTimeString
  const parseDateTimeString = (s) => s; 
  
  const parseDatText = new Function('text', 'parseDateTimeString', 
    body + ' return records;'
  );
  
  const sample = `    123\t2026-08-03 18:22:14\t12\t1\t1\t0
       67\t2026-08-03 23:45:18\t12\t1\t1\t0
       89\t2026-08-04 05:17:20\t12\t0\t1\t0`;
       
  console.log(parseDatText(sample, parseDateTimeString));
} else {
  console.log("Could not extract function");
}
