const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

const regex = /const \[isSaved, setIsSaved\] = useState\(true\);/;

const newCode = `const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setEditedName(employee.employeeIdOrName);
    setEditedRecords(employee.records);
  }, [employee]);`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log("Patched DTREditor sync!");
