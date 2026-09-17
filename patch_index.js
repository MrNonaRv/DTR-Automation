const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Inside settings/sync onSnapshot:
const targetSync = `        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {`;
const replaceSync = `        if (data.activeEmployeeIndex !== undefined && data.activeEmployeeIndex !== currentIndex) {
          setCurrentIndex(data.activeEmployeeIndex);
        }
        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {`;

code = code.replace(targetSync, replaceSync);

const targetIndexSet = `                  onChange={(e) => setCurrentIndex(Number(e.target.value))}`;
const replaceIndexSet = `                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setCurrentIndex(idx);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                  }}`;

code = code.replace(targetIndexSet, replaceIndexSet);

const targetPrev = `onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}`;
const replacePrev = `onClick={() => {
                  setCurrentIndex(prev => {
                    const idx = Math.max(0, prev - 1);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                    return idx;
                  });
                }}`;
code = code.replace(targetPrev, replacePrev);

const targetNext = `onClick={() => setCurrentIndex(prev => Math.min(parsedData.length - 1, prev + 1))}`;
const replaceNext = `onClick={() => {
                  setCurrentIndex(prev => {
                    const idx = Math.min(parsedData.length - 1, prev + 1);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                    return idx;
                  });
                }}`;
code = code.replace(targetNext, replaceNext);

fs.writeFileSync('src/App.tsx', code);
