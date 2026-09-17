const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `if (data.activeEmployeeIndex !== undefined && data.activeEmployeeIndex !== currentIndex) {
          setCurrentIndex(data.activeEmployeeIndex);
        }`;
const replace = `if (data.activeEmployeeIndex !== undefined) {
          setCurrentIndex(data.activeEmployeeIndex);
        }`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Target not found!");
}
