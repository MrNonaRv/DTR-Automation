const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add global sync listener
const autoSyncCode = `
  // MAGIC GLOBAL AUTO-SYNC (Since it's a single user app, we keep all devices on the same page)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'sync'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {
          console.log("Auto-syncing to globally active session:", data.activeSessionId);
          setCurrentSessionId(data.activeSessionId);
          
          // Fetch the data for this session so we can load it instantly
          getDoc(doc(db, 'dtr_sessions', data.activeSessionId)).then(sessionSnap => {
            if (sessionSnap.exists()) {
              const sessionData = sessionSnap.data();
              setCurrentSessionName(sessionData.name);
              setParsedData(sessionData.data);
              if (sessionData.period) setPeriod(sessionData.period);
              setShowEditor(true);
              setToast({ message: "Auto-synced with your other device!", type: "info" });
            }
          });
        }
      }
    });
    return () => unsub();
  }, [currentSessionId]);

  // Update global sync pointer when we manually switch sessions
  useEffect(() => {
    if (currentSessionId) {
      setDoc(doc(db, 'settings', 'sync'), { activeSessionId: currentSessionId }, { merge: true }).catch(e => console.error("Failed to update global sync pointer", e));
    }
  }, [currentSessionId]);
`;

code = code.replace(
  "  // REAL-TIME CLOUD SYNC",
  autoSyncCode + "\n\n  // REAL-TIME CLOUD SYNC"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for magic global auto-sync');
