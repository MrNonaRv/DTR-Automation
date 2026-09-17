const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetAutoSave = `  // AUTO-SAVE PERIOD & NAME
  useEffect(() => {
    if (!currentSessionId) return;
    
    const timer = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
          name: currentSessionName || \`DTR Session - \${new Date().toLocaleDateString()}\`,
          period: period || '',
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Auto-save metadata error:", e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentSessionName, period, currentSessionId]);`;

code = code.replace(targetAutoSave, '');

const targetRename = `                        const newName = prompt("Rename your saved file:", currentSessionName);
                        if (newName) {
                          setCurrentSessionName(newName);
                          setToast({ message: "File renamed! Auto-saving...", type: "success" });
                        }`;
const replaceRename = `                        const newName = prompt("Rename your saved file:", currentSessionName);
                        if (newName) {
                          setCurrentSessionName(newName);
                          if (currentSessionId) {
                            updateDoc(doc(db, 'dtr_sessions', currentSessionId), { name: newName, updatedAt: serverTimestamp() }).catch(console.error);
                          }
                          setToast({ message: "File renamed! Auto-saving...", type: "success" });
                        }`;

code = code.replace(targetRename, replaceRename);

const targetPeriod = `onChange={(e) => setPeriod(e.target.value)}`;
const replacePeriod = `onChange={(e) => {
                        const val = e.target.value;
                        setPeriod(val);
                        if (currentSessionId) {
                          updateDoc(doc(db, 'dtr_sessions', currentSessionId), { period: val, updatedAt: serverTimestamp() }).catch(console.error);
                        }
                      }}`;

code = code.replace(targetPeriod, replacePeriod);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched AutoSave');
