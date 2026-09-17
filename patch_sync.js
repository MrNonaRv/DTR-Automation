const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const syncCode = `
  // REAL-TIME CLOUD SYNC
  useEffect(() => {
    if (!currentSessionId) return;

    const unsub = onSnapshot(doc(db, 'dtr_sessions', currentSessionId), (docSnap) => {
      if (docSnap.exists()) {
        // Ignore local writes that haven't been committed yet to avoid jitter/feedback loops
        if (docSnap.metadata.hasPendingWrites) return;

        const data = docSnap.data();
        
        setParsedData(prevData => {
          if (!prevData) return data.data;
          // Only update if the data actually changed from outside
          const newDataString = JSON.stringify(data.data);
          const prevDataString = JSON.stringify(prevData);
          
          if (newDataString !== prevDataString) {
            console.log('Syncing data from cloud...');
            return data.data;
          }
          return prevData;
        });

        setPeriod(prev => prev !== data.period ? data.period : prev);
        setCurrentSessionName(prev => prev !== data.name ? data.name : prev);
      }
    });

    return () => unsub();
  }, [currentSessionId]);

  useEffect(() => {
    if (parsedData) {`;

code = code.replace(
  "  useEffect(() => {\n    if (parsedData) {",
  syncCode
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for real-time sync');
