const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const target = `  const handleRecordChange = (day: number, field: keyof AttendanceRecord, value: string) => {
    const existingRecord = getRecordForDay(day);
    const dateStr = targetYear !== -1 && targetMonth !== -1 
      ? \`\${targetYear}-\${targetMonth.toString().padStart(2, '0')}-\${day.toString().padStart(2, '0')}\`
      : \`YYYY-MM-\${day.toString().padStart(2, '0')}\`; // Fallback if no period
      
    let newRecords;
    if (existingRecord) {
      newRecords = editedRecords.map(r => r === existingRecord ? { ...r, [field]: value } : r);
    } else {
      newRecords = [...editedRecords, { date: dateStr, amIn: null, amOut: null, pmIn: null, pmOut: null, [field]: value }];
    }
    setEditedRecords(newRecords);
    setIsSaved(false);
    
    // Auto-save debounced
    setDebouncedSave({
      employeeIdOrName: editedName,
      records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
    });
  };`;

const replacement = `  const handleRecordChange = (day: number, field: keyof AttendanceRecord, value: string) => {
    const dateStr = targetYear !== -1 && targetMonth !== -1 
      ? \`\${targetYear}-\${targetMonth.toString().padStart(2, '0')}-\${day.toString().padStart(2, '0')}\`
      : \`YYYY-MM-\${day.toString().padStart(2, '0')}\`; // Fallback if no period
      
    setEditedRecords(prev => {
      const existingRecord = prev.find(r => {
        if (!r.date) return false;
        const parts = r.date.split("-");
        if (parts.length < 3) return false;
        const rYear = parseInt(parts[0], 10);
        const rMonth = parseInt(parts[1], 10);
        const rDay = parseInt(parts[2], 10);
        if (targetYear !== -1 && targetMonth !== -1) {
          return rYear === targetYear && rMonth === targetMonth && rDay === day;
        }
        return rDay === day;
      });
      
      let newRecords;
      if (existingRecord) {
        newRecords = prev.map(r => r === existingRecord ? { ...r, [field]: value } : r);
      } else {
        newRecords = [...prev, { date: dateStr, amIn: null, amOut: null, pmIn: null, pmOut: null, [field]: value }];
      }
      
      setIsSaved(false);
      setDebouncedSave({
        employeeIdOrName: editedName,
        records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
      });
      
      return newRecords;
    });
  };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched closure');
