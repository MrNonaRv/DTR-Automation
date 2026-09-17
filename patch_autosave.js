const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const effectBlock = `
  useEffect(() => {
    if (currentSessionId) { try { localStorage.setItem('dtr_sessionId', currentSessionId); } catch(e) {} }
  }, [currentSessionId]);

  useEffect(() => {
    if (currentSessionName) { try { localStorage.setItem('dtr_sessionName', currentSessionName); } catch(e) {} }
  }, [currentSessionName]);

  // AUTO-SAVE TO CLOUD
  useEffect(() => {
    if (!parsedData || parsedData.length === 0) return;
    
    const timer = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const sessionId = currentSessionId || Math.random().toString(36).substring(2, 12);
        if (!currentSessionId) setCurrentSessionId(sessionId);
        
        const sessionName = currentSessionName || \`DTR Session - \${new Date().toLocaleDateString()}\`;
        if (!currentSessionName) setCurrentSessionName(sessionName);

        await setDoc(doc(db, 'dtr_sessions', sessionId), {
          name: sessionName,
          period: period,
          data: parsedData,
          updatedAt: serverTimestamp()
        });
        
        setAutoSaveStatus('saved');
        loadSavedSessions();
      } catch (e) {
        console.error("Auto-save failed:", e);
        setAutoSaveStatus('idle');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [parsedData, currentSessionName, period]);
`;

code = code.replace(
  "  useEffect(() => {\n    if (parsedData) {",
  effectBlock + "\n  useEffect(() => {\n    if (parsedData) {"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for auto-save');
