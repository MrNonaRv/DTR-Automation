const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                <button 
                  disabled={isCreatingBlank}
                  onClick={async () => {
                    setIsCreatingBlank(true);
                    try {
                      let newEmployees = [];
                    try {
                      const docSnap = await getDoc(doc(db, 'scanner_configs', 'no_biometric'));
                      if (docSnap.exists()) {
                        const parsed = docSnap.data();
                        if (Array.isArray(parsed.people) && parsed.people.length > 0) {
                          newEmployees = parsed.people.map((p, idx) => { const assignedNo = p.empNo || (176 + idx); return { employeeIdOrName: p.name ? p.name.trim() : \`User \${assignedNo}\`, empNo: assignedNo, records: [] }; });
                        }
                      }
                    } catch (e) {
                      console.error("Failed to load no_biometric config", e);
                    }
                    if (newEmployees.length === 0) {
                      newEmployees = [{
                        employeeIdOrName: 'New Employee',
                        records: []
                      }];
                    }
                    const parsedDataArray = [];
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
                    }
                    
                    setParsedData(parsedDataArray);
                    setCurrentIndex(0);
                    setShowEditor(true);
                    } catch(err) {
                      console.error(err);
                    } finally {
                      setIsCreatingBlank(false);
                    }
                  }}
                  className="mt-3 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-medium text-base transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBlank ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create Blank DTR'
                  )}
                </button>`;

const replace = `                <button 
                  disabled={isCreatingBlank}
                  onClick={() => setShowBlankPrompt(true)}
                  className="mt-3 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-medium text-base transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBlank ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create Blank DTR'
                  )}
                </button>`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched the button successfully!");
} else {
  console.log("Could not find the target code for the button in App.tsx");
}
