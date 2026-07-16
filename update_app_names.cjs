const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const titleCaseFunc = `
const toTitleCase = (str: string) => {
  if (!str) return str;
  return str.replace(/\\w\\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
`;

if (!content.includes('toTitleCase')) {
  content = content.replace('export default function App() {', titleCaseFunc + '\\nexport default function App() {');
}

content = content.replace(
  'setParsedData(result.data);',
  `const formattedData = result.data.map((emp: EmployeeAttendance) => ({
        ...emp,
        employeeIdOrName: toTitleCase(emp.employeeIdOrName)
      }));
      setParsedData(formattedData);`
);

fs.writeFileSync('src/App.tsx', content);
