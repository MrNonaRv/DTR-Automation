const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove the entire AUTO-SAVE TO CLOUD block
const autoSaveBlockRegex = /\/\/ AUTO-SAVE TO CLOUD\s+useEffect\(\(\) => \{[\s\S]*?\}, \[parsedData, currentSessionName, period\]\);/m;
code = code.replace(autoSaveBlockRegex, `
  // AUTO-SAVE PERIOD & NAME
  useEffect(() => {
    if (!currentSessionId) return;
    
    const timer = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
          name: currentSessionName || \`DTR Session - \${new Date().toLocaleDateString()}\`,
          period: period,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        // Doc might not exist yet if just created
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentSessionName, period, currentSessionId]);
`);

// 2. Fix handleUpdateEmployee to do field-level update
const handleUpdateEmployeeCode = `const handleUpdateEmployee = React.useCallback(async (idx: number, updatedEmp: EmployeeAttendance) => {
    setParsedData(prev => {
      if (!prev) return null;
      const next = [...prev];
      next[idx] = updatedEmp;
      return next;
    });
    
    // INSTANT CLOUD SYNC FOR THIS SPECIFIC EMPLOYEE ONLY
    if (currentSessionId) {
      setAutoSaveStatus('saving');
      updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        [\`dataMap.\${idx}\`]: updatedEmp,
        updatedAt: serverTimestamp()
      }).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }).catch(e => console.error(e));
    }
  }, [currentSessionId]);`;

code = code.replace(/const handleUpdateEmployee = React.useCallback\(async \(idx: number, updatedEmp: EmployeeAttendance\) => \{[\s\S]*?\}, \[\]\);/, handleUpdateEmployeeCode);

// 3. Fix onSnapshot to use dataMap and remove pending writes block
const onSnapshotBlock = `const unsub = onSnapshot(doc(db, 'dtr_sessions', currentSessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert dataMap back to array
        let serverDataArray = [];
        if (data.dataMap) {
          Object.keys(data.dataMap).forEach(k => serverDataArray[Number(k)] = data.dataMap[k]);
        } else if (data.data) {
          serverDataArray = data.data; // Legacy fallback
        }
        
        setParsedData(prevData => {
          if (!prevData) return serverDataArray;
          // Deep compare string to avoid jitter, but now it's much more stable
          const newDataString = JSON.stringify(serverDataArray);
          const prevDataString = JSON.stringify(prevData);
          
          if (newDataString !== prevDataString) {
            return serverDataArray;
          }
          return prevData;
        });

        setPeriod(prev => prev !== data.period ? data.period : prev);
        setCurrentSessionName(prev => prev !== data.name ? data.name : prev);
      }
    });`;

code = code.replace(/const unsub = onSnapshot\(doc\(db, 'dtr_sessions', currentSessionId\), \(docSnap\) => \{[\s\S]*?\}\);/m, onSnapshotBlock);


// 4. We need to define updateDoc in imports
if (!code.includes('updateDoc')) {
  code = code.replace("import { collection, onSnapshot, doc, setDoc", "import { collection, onSnapshot, doc, setDoc, updateDoc");
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for real-time');
