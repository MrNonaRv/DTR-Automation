const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetCreateSession = `    // Explicitly update global pointer so other devices follow
    setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId }, { merge: true }).catch(console.error);
    
    // Map to object
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => dataMap[i] = emp);
    
    setAutoSaveStatus('saving');
    try {
      await setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);`;

const replaceCreateSession = `    // Map to object
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => dataMap[i] = emp);
    
    setAutoSaveStatus('saving');
    try {
      await setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);
      
      // Explicitly update global pointer so other devices follow AFTER doc is created
      setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId }, { merge: true }).catch(console.error);`;

code = code.replace(targetCreateSession, replaceCreateSession);
fs.writeFileSync('src/App.tsx', code);
console.log('Patched createNewSession');
