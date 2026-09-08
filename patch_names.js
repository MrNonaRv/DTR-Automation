const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/const toTitleCase = [\s\S]*?};\n/, '');
appCode = appCode.replace(/toTitleCase\(emp\.employeeIdOrName\)/g, '(emp.employeeIdOrName || "").toUpperCase()');
appCode = appCode.replace(/employeeIdOrName: p\.name \? p\.name\.trim\(\) : \`User \$\{assignedNo\}\`/g, 'employeeIdOrName: p.name ? p.name.trim().toUpperCase() : `USER ${assignedNo}`');

fs.writeFileSync('src/App.tsx', appCode);

// Patch DTREditor.tsx
let editorCode = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');
editorCode = editorCode.replace(/const toTitleCase = [\s\S]*?};\n/, '');
editorCode = editorCode.replace(/const newName = toTitleCase\(e\.target\.value\);/g, 'const newName = e.target.value.toUpperCase();');
fs.writeFileSync('src/components/DTREditor.tsx', editorCode);

console.log("Patched names");
