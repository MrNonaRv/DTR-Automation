const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// We can add a helper function at the top of App
const helper = `
const withTimeout = (promise: Promise<any>, ms: number = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout/Quota exceeded")), ms);
    promise.then(resolve).catch(reject).finally(() => clearTimeout(timer));
  });
};
`;

code = code.replace("const App = () => {", helper + "\nconst App = () => {");

// Replace in handleUpdateEmployee (which actually doesn't setAutoSaveStatus('saving'), wait, it doesn't!)
// Let's check handleUpdateEmployee:
/*
      updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        [`dataMap.${idx}`]: updatedEmp,
        updatedAt: serverTimestamp()
      }).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 500);
      }).catch((e: any) => console.error(e));
*/
code = code.replace(
  /updateDoc\(doc\(db, 'dtr_sessions', currentSessionId\), \{\n\s*\[\`dataMap\.\$\{idx\}\`\]: updatedEmp,\n\s*updatedAt: serverTimestamp\(\)\n\s*\}\)\.then\(\(\) => \{\n\s*setAutoSaveStatus\('saved'\);\n\s*setTimeout\(\(\) => setAutoSaveStatus\('idle'\), 500\);\n\s*\}\)\.catch\(\(e: any\) => console\.error\(e\)\);/g,
  `withTimeout(updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        [\`dataMap.\${idx}\`]: updatedEmp,
        updatedAt: serverTimestamp()
      })).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 500);
      }).catch((e: any) => {
        setAutoSaveStatus('idle');
        console.error(e);
      });`
);

// Replace in handleAutoFill
/*
      updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      }).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 500);
      }).catch((e: any) => {
        console.error(e);
        setToast({ message: "Failed to sync to cloud. The data might be too large.", type: "error" });
      });
*/
code = code.replace(
  /updateDoc\(doc\(db, 'dtr_sessions', currentSessionId\), \{\n\s*dataMap: dataMap,\n\s*updatedAt: serverTimestamp\(\)\n\s*\}\)\.then\(\(\) => \{\n\s*setAutoSaveStatus\('saved'\);\n\s*setTimeout\(\(\) => setAutoSaveStatus\('idle'\), 500\);\n\s*\}\)\.catch\(\(e: any\) => \{\n\s*console\.error\(e\);\n\s*setToast\(\{ message: "Failed to sync to cloud. The data might be too large.", type: "error" \}\);\n\s*\}\);/g,
  `withTimeout(updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      }), 10000).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 500);
      }).catch((e: any) => {
        setAutoSaveStatus('idle');
        console.error(e);
        setToast({ message: "Cloud sync failed (offline or quota). Saved locally.", type: "warning" });
      });`
);

// Replace in createNewSession
/*
    setAutoSaveStatus('saving');
    try {
      await setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: overridePeriod || period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);
    } catch (e: any) {
      console.error(e);
      setToast({ message: "Failed to save session to cloud", type: "error" });
    }
*/
code = code.replace(
  /setAutoSaveStatus\('saving'\);\n\s*try \{\n\s*await setDoc\(doc\(db, 'dtr_sessions', sessionId\), \{\n\s*name: sessionName,\n\s*period: overridePeriod \|\| period \|\| '',\n\s*dataMap: dataMap,\n\s*updatedAt: serverTimestamp\(\),\n\s*createdAt: serverTimestamp\(\)\n\s*\}\);\n\s*setAutoSaveStatus\('saved'\);\n\s*setTimeout\(\(\) => setAutoSaveStatus\('idle'\), 500\);\n\s*\} catch \(e: any\) \{\n\s*console\.error\(e\);\n\s*setToast\(\{ message: "Failed to save session to cloud", type: "error" \}\);\n\s*\}/g,
  `setAutoSaveStatus('saving');
    try {
      await withTimeout(setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: overridePeriod || period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }), 10000);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);
    } catch (e: any) {
      setAutoSaveStatus('idle');
      console.error(e);
      setToast({ message: "Saved locally. Cloud sync pending (offline/quota).", type: "warning" });
    }`
);

fs.writeFileSync('src/App.tsx', code);
console.log('autosave fixed');
