const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `          getDoc(doc(db, 'dtr_sessions', data.activeSessionId)).then(sessionSnap => {
            if (sessionSnap.exists()) {
              const sessionData = sessionSnap.data();
              setCurrentSessionName(sessionData.name);
              let serverDataArray = [];
              if (sessionData.dataMap) {
                Object.keys(sessionData.dataMap).forEach(k => serverDataArray[Number(k)] = sessionData.dataMap[k]);
              } else if (sessionData.data) {
                serverDataArray = sessionData.data;
              }
              setParsedData(serverDataArray);
              if (sessionData.period) setPeriod(sessionData.period);
              setShowEditor(true);
              setToast({ message: "Auto-synced with your other device!", type: "info" });
            }
          });`,
  `          getDoc(doc(db, 'dtr_sessions', data.activeSessionId)).then(sessionSnap => {
            if (sessionSnap.exists()) {
              const sessionData = sessionSnap.data();
              setCurrentSessionName(sessionData.name);
              let serverDataArray = [];
              if (sessionData.dataMap) {
                Object.keys(sessionData.dataMap).forEach(k => serverDataArray[Number(k)] = sessionData.dataMap[k]);
              } else if (sessionData.data) {
                serverDataArray = sessionData.data;
              }
              setParsedData(serverDataArray);
              if (sessionData.period) setPeriod(sessionData.period);
              setShowEditor(true);
              setToast({ message: "Auto-synced with your other device!", type: "info" });
            }
          }).catch(e => {
            if (e.message && e.message.includes("Quota")) {
               setToast({ message: "Firebase read quota exceeded. Cannot fetch session.", type: "error" });
            } else {
               console.error("fetch session error", e);
            }
          });`
);
fs.writeFileSync('src/App.tsx', code);
console.log('fixed 4');
