const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

code = code.replace(
`  useEffect(() => {
    if (autoFillTrigger > 0) {
      setEditedName(employee.employeeIdOrName);
      setEditedRecords(employee.records);
    }
  }, [autoFillTrigger, employee]);`,
`  useEffect(() => {
    // Sync local state when employee prop changes from outside (e.g., auto-fill or cloud sync)
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records);
  }, [employee, autoFillTrigger]);`
);

fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('DTREditor.tsx patched for state sync');
