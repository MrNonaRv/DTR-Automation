const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    if (userRange.trim()) {
      const match = userRange.trim().match(/^(\\d+)(?:\\s*-\\s*(\\d+))?$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;
        
        const targetIndices = new Set<number>();
        for (let i = start; i <= end; i++) targetIndices.add(i);
        
        employeesToProcess = parsedData.filter((emp, idx) => {
          const userIdentifier = emp.empNo !== undefined ? Number(emp.empNo) : idx + 1;
          return targetIndices.has(userIdentifier);
        });
        
        if (employeesToProcess.length === 0) {
           setToast({ message: "No users matched the specified range.", type: 'error' });
           return;
        }
      } else {
        setToast({ message: "Invalid user range format. Use '1-15' or '5'.", type: 'error' });
        return;
      }
    }`;

const replace = `    if (userRange.trim()) {
      const targetIndices = new Set<number>();
      const parts = userRange.split(',');
      for (const p of parts) {
        const str = p.trim();
        if (!str) continue;
        const match = str.match(/^(\\d+)(?:\\s*-\\s*(\\d+))?$/);
        if (match) {
           const start = parseInt(match[1], 10);
           const end = match[2] ? parseInt(match[2], 10) : start;
           for (let i = start; i <= end; i++) targetIndices.add(i);
        } else {
           const num = parseInt(str, 10);
           if (!isNaN(num)) targetIndices.add(num);
        }
      }
      
      if (targetIndices.size === 0) {
        setToast({ message: "Invalid user format. Use '1, 2, 5-10'.", type: 'error' });
        return;
      }
      
      employeesToProcess = parsedData.filter((emp, idx) => {
        const userIdentifier = emp.empNo !== undefined ? Number(emp.empNo) : idx + 1;
        return targetIndices.has(userIdentifier);
      });
      
      if (employeesToProcess.length === 0) {
         setToast({ message: "No users matched the specified range.", type: 'error' });
         return;
      }
    }`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  
  // Update the label in the UI as well
  const labelSearch = '<label htmlFor="userRange" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Users (e.g. 1-15)</label>';
  const labelReplace = '<label htmlFor="userRange" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Users (e.g. 1, 3-5)</label>';
  code = code.replace(labelSearch, labelReplace);
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched user range parsing!");
} else {
  console.log("Not found.");
}
