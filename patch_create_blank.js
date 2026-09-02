const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add State
const stateSearch = `const [isCreatingBlank, setIsCreatingBlank] = useState(false);`;
const stateReplace = `const [isCreatingBlank, setIsCreatingBlank] = useState(false);
  const [showBlankPrompt, setShowBlankPrompt] = useState(false);`;
code = code.replace(stateSearch, stateReplace);

// 2. Add Function
const functionSearch = `  const handleDrop = (e: React.DragEvent) => {`;
const functionReplace = `  const handleCreateBlank = async (useNoBiometric: boolean) => {
    setShowBlankPrompt(false);
    setIsCreatingBlank(true);
    try {
      let newEmployees: any[] = [];
      if (useNoBiometric) {
        try {
          const docSnap = await getDoc(doc(db, 'scanner_configs', 'no_biometric'));
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            if (Array.isArray(parsed.people) && parsed.people.length > 0) {
              newEmployees = parsed.people.map((p: any, idx: number) => { 
                const assignedNo = p.empNo || (176 + idx); 
                return { employeeIdOrName: p.name ? p.name.trim() : \`User \${assignedNo}\`, empNo: assignedNo, records: [] }; 
              });
            }
          }
        } catch (e) {
          console.error("Failed to load no_biometric config", e);
        }
      }
      
      if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: 'New Employee',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }
      
      const parsedDataArray: any[] = [];
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
  };

  const handleDrop = (e: React.DragEvent) => {`;
code = code.replace(functionSearch, functionReplace);


// 3. Replace Button onClick
const btnSearch = `onClick={async () => {
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
                  }}`;
                  
const btnReplace = `onClick={() => setShowBlankPrompt(true)}`;
code = code.replace(btnSearch, btnReplace);

// 4. Add Modal UI
const modalUI = `
      {showBlankPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Blank DTR</h3>
            <p className="text-gray-500 mb-6 text-sm">Would you like to start with a single empty form, or pre-load the No-Biometric list?</p>
            <div className="space-y-3">
              <button 
                onClick={() => handleCreateBlank(true)}
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                Use No-Biometric Form
              </button>
              <button 
                onClick={() => handleCreateBlank(false)}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Single Blank DTR
              </button>
              <button 
                onClick={() => setShowBlankPrompt(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
`;

const returnSearch = `{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}`;
code = code.replace(returnSearch, returnSearch + modalUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx successfully with Create Blank Prompt!");
