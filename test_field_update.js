const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');
code = code.replace(
  "const [debouncedSave, setDebouncedSave] = useState<{ employeeIdOrName: string; records: AttendanceRecord[] } | null>(null);",
  "const [debouncedSave, setDebouncedSave] = useState<{ employeeIdOrName: string; records: AttendanceRecord[] } | null>(null);\n  console.log('DTREditor render', {editedName, recordsLen: editedRecords.length, debouncedSave});"
);
fs.writeFileSync('src/components/DTREditor.tsx', code);
