const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetImport = `import { DTREditor } from './components/DTREditor';`;
const replaceImport = `import { DTREditor } from './components/DTREditor';\nimport { SearchableSelect } from './components/SearchableSelect';`;

code = code.replace(targetImport, replaceImport);

const targetSelect = `                <select
                  value={currentIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setCurrentIndex(idx);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                  }}
                  className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  {parsedData.map((emp, idx) => (
                    <option key={idx} value={idx}>
                      {emp.empNo !== undefined ? emp.empNo : idx + 1}. {emp.employeeIdOrName}
                    </option>
                  ))}
                </select>`;

const replaceSelect = `                <SearchableSelect
                  value={currentIndex}
                  onChange={(idx) => {
                    setCurrentIndex(idx);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                  }}
                  options={parsedData.map((emp, idx) => ({
                    value: idx,
                    label: \`\${emp.empNo !== undefined ? emp.empNo : idx + 1}. \${emp.employeeIdOrName}\`
                  }))}
                />`;

code = code.replace(targetSelect, replaceSelect);

fs.writeFileSync('src/App.tsx', code);
