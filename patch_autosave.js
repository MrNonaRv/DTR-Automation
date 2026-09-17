const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// In handleEmployeeUpdate
code = code.replace(
  "    // INSTANT CLOUD SYNC FOR THIS SPECIFIC EMPLOYEE ONLY\n    if (currentSessionId) {\n      setAutoSaveStatus('saving');",
  "    // INSTANT CLOUD SYNC FOR THIS SPECIFIC EMPLOYEE ONLY\n    if (currentSessionId) {\n      // Silently sync to avoid UI disruption"
);

// In handleAddBlankDTR
code = code.replace(
  "    const newEmp: EmployeeAttendance = {\n      employeeIdOrName: `Employee ${parsedData ? parsedData.length + 1 : 1}`,\n      records: []\n    };\n    \n    setAutoSaveStatus('saving');",
  "    const newEmp: EmployeeAttendance = {\n      employeeIdOrName: `Employee ${parsedData ? parsedData.length + 1 : 1}`,\n      records: []\n    };\n    \n    // Silently sync"
);

fs.writeFileSync('src/App.tsx', code);
console.log('autosave patched');
