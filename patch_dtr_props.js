const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

if (!code.includes('autoFillTrigger')) {
  // Add autoFillTrigger to props
  code = code.replace(
    "onDownload: (employee: EmployeeAttendance) => void;",
    "onDownload: (employee: EmployeeAttendance) => void;\\n  autoFillTrigger?: number;"
  );
  
  code = code.replace(
    "export const DTREditor = memo(function DTREditor({ index, employee, period, printRange = 'full', onUpdate, onDownload }: DTREditorProps) {",
    "export const DTREditor = memo(function DTREditor({ index, employee, period, printRange = 'full', onUpdate, onDownload, autoFillTrigger = 0 }: DTREditorProps) {"
  );
  
  // Add useEffect to sync
  const stateRegex = /const \[isSaved, setIsSaved\] = useState\(true\);/;
  const newSync = `const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (autoFillTrigger > 0) {
      setEditedName(employee.employeeIdOrName);
      setEditedRecords(employee.records);
    }
  }, [autoFillTrigger, employee]);`;
  
  code = code.replace(stateRegex, newSync);
}
fs.writeFileSync('src/components/DTREditor.tsx', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  "employee={parsedData[currentIndex]}",
  "employee={parsedData[currentIndex]}\\n                  autoFillTrigger={autoFillTrigger}"
);
fs.writeFileSync('src/App.tsx', appCode);

console.log("Patched DTREditor props!");
