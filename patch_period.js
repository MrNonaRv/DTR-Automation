const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleUpload \= async \(\) \=\> \{[\s\S]*?finally \{/m;
const match = code.match(regex);

if (match) {
  let uploadFunc = match[0];
  
  const injectCode = `
      // Auto-detect period from uploaded data
      if (formattedData && formattedData.length > 0) {
        for (const emp of formattedData) {
          if (emp.records && emp.records.length > 0) {
            const firstDateStr = emp.records[0].date;
            if (firstDateStr) {
              const parts = firstDateStr.split('-');
              if (parts.length >= 2) {
                const year = parts[0];
                const month = parts[1].padStart(2, '0');
                const detectedPeriod = \`\${year}-\${month}\`;
                setPeriod(detectedPeriod);
                break; // Found a valid date, break out
              }
            }
          }
        }
      }
      
      setCurrentSessionId`;
      
  uploadFunc = uploadFunc.replace("setCurrentSessionId", injectCode);
  
  code = code.replace(match[0], uploadFunc);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx patched for auto period detection');
} else {
  console.log('Could not find handleUpload function');
}
