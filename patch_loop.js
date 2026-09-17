const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const effectTarget = `  useEffect(() => {
    if (debouncedSave) {
      const timer = setTimeout(() => {
        onUpdate(index, {
          ...employee,
          employeeIdOrName: debouncedSave.employeeIdOrName,
          records: debouncedSave.records
        });
        setIsSaved(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [debouncedSave, index, employee, onUpdate]);`;

const effectReplacement = `  useEffect(() => {
    if (debouncedSave) {
      const timer = setTimeout(() => {
        onUpdate(index, {
          ...employee,
          employeeIdOrName: debouncedSave.employeeIdOrName,
          records: debouncedSave.records
        });
        setIsSaved(true);
        setDebouncedSave(null); // Prevent infinite loop!
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [debouncedSave, index, employee, onUpdate]);`;

code = code.replace(effectTarget, effectReplacement);
fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched infinite loop');
