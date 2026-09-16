const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const sessionDepsSearch = `  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('dtr_parsedData', JSON.stringify(parsedData));
    } else {
      localStorage.removeItem('dtr_parsedData');
    }
  }, [parsedData]);`;

const sessionDepsReplace = `  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('dtr_parsedData', JSON.stringify(parsedData));
    } else {
      localStorage.removeItem('dtr_parsedData');
    }
  }, [parsedData]);

  useEffect(() => {
    if (currentSessionId) localStorage.setItem('dtr_sessionId', currentSessionId);
    else localStorage.removeItem('dtr_sessionId');
  }, [currentSessionId]);

  useEffect(() => {
    if (currentSessionName) localStorage.setItem('dtr_sessionName', currentSessionName);
    else localStorage.removeItem('dtr_sessionName');
  }, [currentSessionName]);

  // Real-time auto-sync to Firebase
  useEffect(() => {
    if (!parsedData || !currentSessionId) return;
    setAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const sessionRef = doc(db, 'dtr_sessions', currentSessionId);
        await setDoc(sessionRef, {
          name: currentSessionName || 'Untitled Session',
          period: period,
          data: parsedData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setAutoSaveStatus('saved');
        loadSavedSessions();
      } catch (e) {
        console.error("Failed to sync to cloud:", e);
        setAutoSaveStatus('idle');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [parsedData, period, currentSessionName, currentSessionId]);`;

code = code.replace(sessionDepsSearch, sessionDepsReplace);

code = code.replace(
  'setParsedData(parsedDataArray);\n      setCurrentIndex(0);\n      setShowEditor(true);',
  `setParsedData(parsedDataArray);\n      setCurrentIndex(0);\n      setShowEditor(true);\n      const newId = doc(collection(db, 'dtr_sessions')).id;\n      setCurrentSessionId(newId);\n      setCurrentSessionName('Blank Session ' + new Date().toLocaleDateString());`
);

code = code.replace(
  `setParsedData(formattedData);\n      \n      setToast({ message: 'DTR Data uploaded successfully.', type: 'success' });`,
  `setParsedData(formattedData);\n      const newId = doc(collection(db, 'dtr_sessions')).id;\n      setCurrentSessionId(newId);\n      setCurrentSessionName(file.name.replace(/\\.[^/.]+$/, ""));\n      setToast({ message: 'DTR Data uploaded successfully.', type: 'success' });`
);

code = code.replace(
  `setParsedData(session.data);\n                              if (session.period) setPeriod(session.period);\n                              setShowEditor(true);`,
  `setParsedData(session.data);\n                              if (session.period) setPeriod(session.period);\n                              setCurrentSessionId(session.id);\n                              setCurrentSessionName(session.name);\n                              setShowEditor(true);`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for auto-save");
