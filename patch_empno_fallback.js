const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /newEmployees = parsed\.people\.map\(p => \(\{\s*employeeIdOrName: p\.name \? p\.name\.trim\(\) : \`User \$\{p\.empNo\}\`,\s*empNo: p\.empNo,\s*records: \[\]\s*\}\)\);/;
const replacement = "newEmployees = parsed.people.map((p, idx) => { const assignedNo = p.empNo || (176 + idx); return { employeeIdOrName: p.name ? p.name.trim() : `User ${assignedNo}`, empNo: assignedNo, records: [] }; });";

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched empNo fallback logic");
