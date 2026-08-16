const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `const formattedPeriod = period ? \`_\${period.replace(/\\s+/g, '_')}\` : "";
      link.setAttribute('download', \`All_DTRs\${formattedPeriod}.pdf\`);`;

const replacementStr = `      let downloadFileName = "All_DTR.pdf";
      if (period) {
        try {
          const [year, month] = period.split('-');
          const y = parseInt(year);
          const m = parseInt(month);
          const dateObj = new Date(y, m - 1, 1);
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
          const lastDay = new Date(y, m, 0).getDate();
          
          let dateRangeStr = \`1-\${lastDay}\`;
          if (printRange === '1-15') {
            dateRangeStr = '1-15';
          } else if (printRange === '16-31') {
            dateRangeStr = \`16-\${lastDay}\`;
          }
          
          downloadFileName = \`All_DTR_\${monthName}_\${dateRangeStr}_\${y}.pdf\`;
        } catch(e) {
          downloadFileName = \`All_DTR_\${period}_\${printRange}.pdf\`;
        }
      }
      link.setAttribute('download', downloadFileName);`;

if (code.includes('All_DTRs${formattedPeriod}.pdf')) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched correctly");
} else {
  console.log("Could not find target string");
}
