const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Update settings/sync listener to also pick up activeIndex
code = code.replace(
  /if \(data\.activeSessionId && data\.activeSessionId !== currentSessionId\) \{/,
  `if (data.activeIndex !== undefined && data.activeIndex !== currentIndex) {
          console.log("Auto-syncing to globally active index:", data.activeIndex);
          setCurrentIndex(data.activeIndex);
        }
        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {`
);

// Add activeIndex to the createNewSession block
code = code.replace(
  /setDoc\(doc\(db, 'settings', 'sync'\), \{ activeSessionId: sessionId \}, \{ merge: true \}\)\.catch\(console\.error\);/,
  `setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId, activeIndex: 0 }, { merge: true }).catch(console.error);`
);

// Add activeIndex to the onClick for Next/Prev/Select user
code = code.replace(
  /setCurrentIndex\((.*?)\);/g,
  (match, p1) => {
    // Only wrap direct state setters that aren't inside the listener
    return `setCurrentIndex(${p1});
    try {
      const newVal = typeof ${p1} === 'function' ? ${p1}(currentIndex) : ${p1};
      setDoc(doc(db, 'settings', 'sync'), { activeIndex: newVal }, { merge: true }).catch(e => {});
    } catch(err){}`;
  }
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with global index sync.");
