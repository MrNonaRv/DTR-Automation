const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const createFunction = `  const createNewSession = async (newDataArray: any[]) => {
    const sessionId = Math.random().toString(36).substring(2, 12);
    const sessionName = \`DTR Session - \${new Date().toLocaleDateString()}\`;
    setCurrentSessionId(sessionId);
    setCurrentSessionName(sessionName);
    setParsedData(newDataArray);
    
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
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      loadSavedSessions();
    } catch(e) {
      console.error(e);
      setAutoSaveStatus('idle');
    }
  };
`;

code = code.replace("const loadSavedSessions = async () => {", createFunction + "\n  const loadSavedSessions = async () => {");

// Now replace usages in handleCreateBlank
code = code.replace(
  "setParsedData(parsedDataArray);\n      setCurrentIndex(0);",
  "createNewSession(parsedDataArray);\n      setCurrentIndex(0);"
);

// Now replace usages in handleFileUpload
code = code.replace(
  "setCurrentSessionId(null);\n      setCurrentSessionName(`DTR Session - ${new Date().toLocaleDateString()}`);\n      setParsedData(formattedData);",
  "createNewSession(formattedData);"
);

// Remove the setParsedData when clearing all records just in case, wait no, clearing records is fine, it just unloads the session.
code = code.replace(
  "setParsedData(null); setFile(null); setShowEditor(false);",
  "setParsedData(null); setFile(null); setShowEditor(false); setCurrentSessionId(null);"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with createNewSession');
