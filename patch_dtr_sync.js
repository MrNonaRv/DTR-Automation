const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const targetUseEffect = `  useEffect(() => {
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records || []);
    setIsSaved(true);
    setDebouncedSave(null);
  }, [employee]);`;

const newUseEffect = `  const lastSavedRef = React.useRef<string | null>(null);

  useEffect(() => {
    const currentStr = JSON.stringify({ employeeIdOrName: employee.employeeIdOrName, records: employee.records || [] });
    if (lastSavedRef.current === currentStr) {
      return; // Our own update echoing back
    }
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records || []);
    setIsSaved(true);
    setDebouncedSave(null);
    lastSavedRef.current = currentStr;
  }, [employee, index]);`;

code = code.replace(targetUseEffect, newUseEffect);

const targetTimer = `        onUpdate(index, {
          ...employee,
          employeeIdOrName: debouncedSave.employeeIdOrName,
          records: debouncedSave.records
        });
        setIsSaved(true);
        setDebouncedSave(null); // Prevent infinite loop!`;

const newTimer = `        const newData = {
          ...employee,
          employeeIdOrName: debouncedSave.employeeIdOrName,
          records: debouncedSave.records
        };
        lastSavedRef.current = JSON.stringify({ employeeIdOrName: newData.employeeIdOrName, records: newData.records });
        onUpdate(index, newData);
        setIsSaved(true);
        setDebouncedSave(null); // Prevent infinite loop!`;

code = code.replace(targetTimer, newTimer);

fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched DTREditor.tsx');
