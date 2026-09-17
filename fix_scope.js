const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `      // Auto-detect period from uploaded data
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
      
      createNewSession(formattedData, detectedPeriod);`;

const replace = `      // Auto-detect period from uploaded data
      let finalPeriod = period;
      if (formattedData && formattedData.length > 0) {
        for (const emp of formattedData) {
          if (emp.records && emp.records.length > 0) {
            const firstDateStr = emp.records[0].date;
            if (firstDateStr) {
              const parts = firstDateStr.split('-');
              if (parts.length >= 2) {
                const year = parts[0];
                const month = parts[1].padStart(2, '0');
                finalPeriod = \`\${year}-\${month}\`;
                setPeriod(finalPeriod);
                break; // Found a valid date, break out
              }
            }
          }
        }
      }
      
      createNewSession(formattedData, finalPeriod);`;

code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed scope block');
