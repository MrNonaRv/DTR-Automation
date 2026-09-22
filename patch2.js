const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const targetUseEffect = `  useEffect(() => {
    // Sync local state when employee prop changes from outside (e.g., auto-fill or cloud sync)
    console.log("DTREditor: employee prop changed. isSaved:", isSaved);
    // ONLY overwrite if the user isn't actively typing/unsaved
    if (isSaved) {
      setEditedName(employee.employeeIdOrName);
      setEditedRecords(employee.records);
    }
  }, [employee, autoFillTrigger, isSaved]);`;

const newUseEffect = `  const lastSavedRef = React.useRef<string | null>(null);

  useEffect(() => {
    const currentStr = JSON.stringify({ employeeIdOrName: employee.employeeIdOrName, records: employee.records || [] });
    if (lastSavedRef.current === currentStr) {
      return; // Our own update echoing back
    }
    // We update local state when the prop changes to something new
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records || []);
    setIsSaved(true);
    setDebouncedSave(null);
    lastSavedRef.current = currentStr;
  }, [employee, autoFillTrigger, index]);`;

code = code.replace(targetUseEffect, newUseEffect);
fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched again');
