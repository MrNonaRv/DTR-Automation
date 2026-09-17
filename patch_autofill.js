const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `    setParsedData(newData);
    
    // INSTANT CLOUD SYNC FOR AUTO-FILL
    if (currentSessionId) {
      setAutoSaveStatus('saving');
      const dataMap: any = {};
      newData.forEach((emp, i) => dataMap[i] = emp);
      
      updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      }).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }).catch(e => console.error(e));
    }
    
    setAutoFillTrigger(prev => prev + 1);`;

code = code.replace("setParsedData(newData);\n    setAutoFillTrigger(prev => prev + 1);", replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for autofill sync');
