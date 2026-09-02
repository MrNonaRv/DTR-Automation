const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace handleCreateBlank signature
code = code.replace(
  'const handleCreateBlank = async (useNoBiometric: boolean) => {',
  'const handleCreateBlank = async (useNoBiometric: boolean, count: number = 1) => {'
);

// Replace the fallback condition
const fallbackSearch = `      if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: 'New Employee',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }`;

const fallbackReplace = `      if (!useNoBiometric && count > 0) {
        newEmployees = Array.from({ length: count }, (_, i) => ({
          employeeIdOrName: count > 1 ? \`User \${i + 1}\` : 'New Employee',
          empNo: count > 1 ? i + 1 : undefined,
          records: []
        }));
      } else if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: 'New Employee',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }`;

code = code.replace(fallbackSearch, fallbackReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully!");

