const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const targetUseEffect = `  useEffect(() => {
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

const newUseEffect = `  const lastIndexRef = React.useRef<number>(index);

  useEffect(() => {
    const currentStr = JSON.stringify({ employeeIdOrName: employee.employeeIdOrName, records: employee.records || [] });
    const isIndexChange = lastIndexRef.current !== index;
    lastIndexRef.current = index;
    
    // Only skip update if it's our own update echoing back AND the index hasn't changed
    if (!isIndexChange && lastSavedRef.current === currentStr) {
      return; 
    }
    
    // We update local state when the prop changes to something new or index changes
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records || []);
    setIsSaved(true);
    setDebouncedSave(null);
    lastSavedRef.current = currentStr;
  }, [employee, autoFillTrigger, index]);`;

code = code.replace(targetUseEffect, newUseEffect);
fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched index sync');
