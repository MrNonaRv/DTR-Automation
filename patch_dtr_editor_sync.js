const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const target = `  useEffect(() => {
    // Sync local state when employee prop changes from outside (e.g., auto-fill or cloud sync)
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records);
  }, [employee, autoFillTrigger]);`;

const replacement = `  useEffect(() => {
    // Sync local state when employee prop changes from outside (e.g., auto-fill or cloud sync)
    // ONLY overwrite if the user isn't actively typing/unsaved
    if (isSaved) {
      setEditedName(employee.employeeIdOrName);
      setEditedRecords(employee.records);
    }
  }, [employee, autoFillTrigger, isSaved]);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched sync jitter');
