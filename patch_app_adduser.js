const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `onClick={async () => {
                        const newRef = doc(collection(db, 'dtr_records'));
                        await setDoc(newRef, { employeeIdOrName: 'New Employee', records: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), userId: 'anonymous' });
                        const newEmp = { id: newRef.id, employeeIdOrName: 'New Employee', records: [] };
                        setParsedData(prev => prev ? [...prev, newEmp] : [newEmp]);
                        setCurrentIndex(parsedData ? parsedData.length : 0);
                      }}`;

const replace = `onClick={async () => {
                        const newRef = doc(collection(db, 'dtr_records'));
                        try {
                          await setDoc(newRef, { employeeIdOrName: 'New Employee', records: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), userId: 'anonymous' });
                        } catch (e: any) {
                          console.error(e);
                          if (e?.code === 'resource-exhausted' || e?.message?.includes('Quota')) {
                            setToast({ message: 'Firebase quota exceeded. User added locally only.', type: 'warn' });
                          } else {
                            setToast({ message: 'Failed to sync to cloud. User added locally.', type: 'warn' });
                          }
                        }
                        const newEmp = { id: newRef.id, employeeIdOrName: 'New Employee', records: [] };
                        setParsedData(prev => prev ? [...prev, newEmp] : [newEmp]);
                        setCurrentIndex(parsedData ? parsedData.length : 0);
                      }}`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx add user!");
} else {
  console.log("Could not find the target code for Add a new user in App.tsx");
}
