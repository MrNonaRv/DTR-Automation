const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<button \s*onClick=\{async \(\) => \{\s*const newRef = doc\(collection\(db, 'dtr_records'\)\);[\s\S]*?setCurrentIndex\(parsedData \? parsedData.length : 0\);\s*\}\}\s*className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600/m;

const replacement = `<button 
                      onClick={async () => {
                        const newEmp = { employeeIdOrName: '', records: [] };
                        const newIndex = parsedData ? parsedData.length : 0;
                        setParsedData(prev => prev ? [...prev, newEmp] : [newEmp]);
                        setCurrentIndex(newIndex);
                        
                        if (currentSessionId) {
                          updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
                            [\`dataMap.\${newIndex}\`]: newEmp,
                            updatedAt: serverTimestamp()
                          }).catch(e => console.error(e));
                        }
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for add user');
