const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    if (autoFillUsers.trim().toLowerCase() === 'all' || autoFillUsers.trim() === '') {
      parsedData.forEach((emp, idx) => targetIndices.add(emp.empNo !== undefined ? Number(emp.empNo) : idx + 1));
    } else {`;

const replace = `    if (autoFillUsers.trim().toLowerCase() === 'all') {
      parsedData.forEach((emp, idx) => targetIndices.add(emp.empNo !== undefined ? Number(emp.empNo) : idx + 1));
    } else if (autoFillUsers.trim() === '') {
      // If blank, only apply to the currently viewed user in the editor
      const currentEmp = parsedData[currentIndex];
      if (currentEmp) {
        targetIndices.add(currentEmp.empNo !== undefined ? Number(currentEmp.empNo) : currentIndex + 1);
      }
    } else {`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched auto-fill to default to current user!");
} else {
  console.log("Could not find auto-fill target logic.");
}
