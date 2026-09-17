const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove the automatic update of global sync pointer
const targetAutoSync = `  // Update global sync pointer when we manually switch sessions
  useEffect(() => {
    if (currentSessionId) {
      setDoc(doc(db, 'settings', 'sync'), { activeSessionId: currentSessionId }, { merge: true }).catch((e: any) => console.error("Failed to update global sync pointer", e));
    }
  }, [currentSessionId]);`;
code = code.replace(targetAutoSync, '');

// 2. Add explicit updates
// a. createNewSession
const targetCreateSession = `    setCurrentSessionId(sessionId);
    setCurrentSessionName(sessionName);
    setParsedData(newDataArray);
    
    // Map to object
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => dataMap[i] = emp);`;

const replaceCreateSession = `    setCurrentSessionId(sessionId);
    setCurrentSessionName(sessionName);
    setParsedData(newDataArray);
    
    // Explicitly update global pointer so other devices follow
    setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId }, { merge: true }).catch(console.error);
    
    // Map to object
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => dataMap[i] = emp);`;
code = code.replace(targetCreateSession, replaceCreateSession);

// b. Explicitly loading a session
const targetLoadSession = `                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                              setShowAllSessionsModal(false);`;

const replaceLoadSession = `                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                              setShowAllSessionsModal(false);
                              // Notify other devices
                              setDoc(doc(db, 'settings', 'sync'), { activeSessionId: session.id }, { merge: true }).catch(console.error);`;
code = code.replace(targetLoadSession, replaceLoadSession);

fs.writeFileSync('src/App.tsx', code);
console.log('patched sync');
