const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `      if (!useNoBiometric && count > 0) {
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

const replace = `      if (!useNoBiometric && count > 0) {
        newEmployees = Array.from({ length: count }, (_, i) => ({
          employeeIdOrName: '',
          empNo: count > 1 ? i + 1 : undefined,
          records: []
        }));
      } else if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: '',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }`;

code = code.replace(search, replace);

// Also need to patch the Add New User button so it uses '' instead of 'New Employee'
const addBtnSearch = `                          await setDoc(newRef, { employeeIdOrName: 'New Employee', records: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), userId: 'anonymous' });
                        } catch (e: any) {
                          
                          if (e?.code === 'resource-exhausted' || e?.message?.includes('Quota')) {
                            setToast({ message: 'Firebase quota exceeded. User added locally only.', type: 'warn' });
                          } else {
                            setToast({ message: 'Failed to sync to cloud. User added locally.', type: 'warn' });
                          }
                        }
                        const newEmp = { id: newRef.id, employeeIdOrName: 'New Employee', records: [] };`;
                        
const addBtnReplace = `                          await setDoc(newRef, { employeeIdOrName: '', records: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), userId: 'anonymous' });
                        } catch (e: any) {
                          
                          if (e?.code === 'resource-exhausted' || e?.message?.includes('Quota')) {
                            setToast({ message: 'Firebase quota exceeded. User added locally only.', type: 'warn' });
                          } else {
                            setToast({ message: 'Failed to sync to cloud. User added locally.', type: 'warn' });
                          }
                        }
                        const newEmp = { id: newRef.id, employeeIdOrName: '', records: [] };`;

code = code.replace(addBtnSearch, addBtnReplace);


fs.writeFileSync('src/App.tsx', code);
console.log("Patched!");
