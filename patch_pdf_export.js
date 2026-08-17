const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogic = `        if (start > 0 && start <= parsedData.length) {
           const actualEnd = Math.min(end, parsedData.length);
           employeesToProcess = parsedData.slice(start - 1, actualEnd);
        } else {
           setToast({ message: "Invalid user range. Start index out of bounds.", type: 'error' });
           return;
        }`;

const newLogic = `        const targetIndices = new Set<number>();
        for (let i = start; i <= end; i++) targetIndices.add(i);
        
        employeesToProcess = parsedData.filter((emp, idx) => {
          const userIdentifier = emp.empNo !== undefined ? Number(emp.empNo) : idx + 1;
          return targetIndices.has(userIdentifier);
        });
        
        if (employeesToProcess.length === 0) {
           setToast({ message: "No users matched the specified range.", type: 'error' });
           return;
        }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched PDF export user filter");
