const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /if \(confirm\(\`Are you sure you want to delete \$\{emp\.employeeIdOrName\}\?\`\)\) \{[\s\S]*?setToast\(\{ message: 'User deleted successfully', type: 'success' \}\);\s*\}/m;

const replacement = `if (confirm(\`Are you sure you want to delete \${emp.employeeIdOrName}?\`)) {
                        const isLast = parsedData.length === 1;
                        let nextArray = [];
                        setParsedData(prev => {
                          if (!prev) return null;
                          const next = prev.filter((_, i) => i !== currentIndex);
                          nextArray = next;
                          return next.length > 0 ? next : null;
                        });
                        
                        // SYNC DELETION (Full array rewrite needed because indices shift)
                        if (currentSessionId && !isLast) {
                           const dataMap = {};
                           nextArray.forEach((e, i) => dataMap[i] = e);
                           updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
                             dataMap: dataMap,
                             updatedAt: serverTimestamp()
                           }).catch(e => console.error(e));
                        } else if (currentSessionId && isLast) {
                           deleteDoc(doc(db, 'dtr_sessions', currentSessionId)).catch(e => console.error(e));
                        }
                        
                        if (isLast) {
                          setShowEditor(false);
                        } else {
                          setCurrentIndex(prev => Math.max(0, prev - 1));
                        }
                        setToast({ message: 'User deleted successfully', type: 'success' });
                      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for deletion');
