const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `    setAutoSaveStatus('saving');
    try {
      await setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: overridePeriod || period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);
      
      // Explicitly update global pointer so other devices follow AFTER doc is created
      setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId }, { merge: true }).catch(console.error);
      loadSavedSessions();
    } catch(e: any) {
      console.error(e);
      setAutoSaveStatus('idle');
      setToast({ message: "Failed to save session to cloud. File may be too large.", type: "error" });
    }`;

const newCode = `    setAutoSaveStatus('saving');
    try {
      await withTimeout(setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: overridePeriod || period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      }), 10000);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);
      
      // Explicitly update global pointer so other devices follow AFTER doc is created
      setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId }, { merge: true }).catch(console.error);
      loadSavedSessions();
    } catch(e: any) {
      console.error(e);
      setAutoSaveStatus('idle');
      setToast({ message: "Saved locally. Cloud sync pending (offline/quota).", type: "warning" });
    }`;

code = code.replace(target, newCode);
fs.writeFileSync('src/App.tsx', code);
console.log('fixed createNewSession');
