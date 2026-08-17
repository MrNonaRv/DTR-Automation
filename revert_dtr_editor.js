const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

const regex = /const \[isSaved, setIsSaved\] = useState\(true\);\s*useEffect\(\(\) => \{\s*setEditedName\(employee.employeeIdOrName\);\s*setEditedRecords\(employee.records\);\s*\}, \[employee\]\);/;

code = code.replace(regex, "const [isSaved, setIsSaved] = useState(true);");
fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log("Reverted DTREditor sync");
