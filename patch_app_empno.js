const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace mapping inside no_biometric pull
code = code.replace(
  /newEmployees = parsed.people.map\(p => \(\{\s*employeeIdOrName: p\.name \? p\.name\.trim\(\) : \`User \$\{p\.empNo\}\`,\s*records: \[\]\s*\}\)\);/,
  "newEmployees = parsed.people.map(p => ({ employeeIdOrName: p.name ? p.name.trim() : `User ${p.empNo}`, empNo: p.empNo, records: [] }));"
);

// Add empNo to parsedDataArray
code = code.replace(
  /parsedDataArray\.push\(\{\s*id: newRef\.id,\s*employeeIdOrName: emp\.employeeIdOrName,\s*records: \[\]\s*\}\);/g,
  "parsedDataArray.push({ id: newRef.id, employeeIdOrName: emp.employeeIdOrName, empNo: emp.empNo, records: [] });"
);

// We need to update the options dropdown to use empNo if available, otherwise fallback to idx + 1
code = code.replace(
  /\{idx \+ 1\}\. \{emp\.employeeIdOrName\}/g,
  "{emp.empNo !== undefined ? emp.empNo : idx + 1}. {emp.employeeIdOrName}"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with empNo logic");
