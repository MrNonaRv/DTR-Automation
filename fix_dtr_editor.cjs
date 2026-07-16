const fs = require('fs');
let content = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

// Replace handleRecordChange
content = content.replace(
  /const handleRecordChange = [\s\S]*?setIsSaved\(false\);\n  };/,
  `const handleRecordChange = (day: number, field: keyof AttendanceRecord, value: string) => {
    const existingRecord = getRecordForDay(day);
    const dateStr = targetYear !== -1 && targetMonth !== -1 
      ? \`\${targetYear}-\${targetMonth.toString().padStart(2, '0')}-\${day.toString().padStart(2, '0')}\`
      : \`YYYY-MM-\${day.toString().padStart(2, '0')}\`; // Fallback if no period
      
    let newRecords;
    if (existingRecord) {
      newRecords = editedRecords.map(r => r === existingRecord ? { ...r, [field]: value } : r);
    } else {
      newRecords = [...editedRecords, { date: dateStr, [field]: value }];
    }
    setEditedRecords(newRecords);
    setIsSaved(false);
    
    // Auto-save immediately
    onUpdate(index, {
      ...employee,
      employeeIdOrName: editedName,
      records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
    });
    setTimeout(() => setIsSaved(true), 800);
  };`
);

// Replace handleNameChange
content = content.replace(
  /const handleNameChange = [\s\S]*?setIsSaved\(false\);\n  };/,
  `const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setEditedName(newName);
    setIsSaved(false);
    
    // Auto-save immediately
    onUpdate(index, {
      ...employee,
      employeeIdOrName: newName,
      records: editedRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
    });
    setTimeout(() => setIsSaved(true), 800);
  };`
);

// Remove useEffect auto-save debounce
content = content.replace(
  /\/\/ Auto-save debounced\n  useEffect\(\(\) => {[\s\S]*?}, \[editedName, editedRecords, isSaved, employee, onUpdate, index\]\);/,
  ""
);

fs.writeFileSync('src/components/DTREditor.tsx', content);
