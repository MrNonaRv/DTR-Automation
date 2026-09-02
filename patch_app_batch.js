const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                    const parsedDataArray = [];
                    for (const emp of newEmployees) {
                      const newRef = doc(collection(db, 'dtr_records'));
                      await setDoc(newRef, {
                        employeeIdOrName: emp.employeeIdOrName,
                        records: [],
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        userId: 'anonymous'
                      });
                      parsedDataArray.push({ id: newRef.id, employeeIdOrName: emp.employeeIdOrName, empNo: emp.empNo, records: [] });
                    }`;

const replace = `                    const parsedDataArray = [];
                    try {
                      let currentBatch = writeBatch(db);
                      let batchCount = 0;
                      
                      for (const emp of newEmployees) {
                        const newRef = doc(collection(db, 'dtr_records'));
                        currentBatch.set(newRef, {
                          employeeIdOrName: emp.employeeIdOrName,
                          records: [],
                          createdAt: serverTimestamp(),
                          updatedAt: serverTimestamp(),
                          userId: 'anonymous'
                        });
                        parsedDataArray.push({ id: newRef.id, employeeIdOrName: emp.employeeIdOrName, empNo: emp.empNo, records: [] });
                        batchCount++;
                        
                        if (batchCount === 450) {
                          await currentBatch.commit();
                          currentBatch = writeBatch(db);
                          batchCount = 0;
                        }
                      }
                      
                      if (batchCount > 0) {
                        await currentBatch.commit();
                      }
                    } catch (e: any) {
                      console.error("Firestore batch error:", e);
                      if (e?.code === 'resource-exhausted' || e?.message?.includes('Quota')) {
                        setToast({ message: 'Firebase daily quota exceeded. Data loaded locally instead.', type: 'error' });
                      } else {
                        setToast({ message: 'Cloud sync failed. Data loaded locally.', type: 'error' });
                      }
                      // Keep the data in memory even if cloud failed
                      if (parsedDataArray.length === 0) {
                         newEmployees.forEach(emp => {
                           parsedDataArray.push({ id: Math.random().toString(), employeeIdOrName: emp.employeeIdOrName, empNo: emp.empNo, records: [] });
                         });
                      }
                    }`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx with batching!");
} else {
  console.log("Could not find the target code in App.tsx");
}
