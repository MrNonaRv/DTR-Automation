const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Undo the broken regex replacement
code = code.replace(
  /setCurrentIndex\((.*?)\);\s*try \{\s*const newVal = typeof .*? === 'function' \? .*?\(currentIndex\) : .*?;\s*setDoc\(doc\(db, 'settings', 'sync'\), \{ activeIndex: newVal \}, \{ merge: true \}\)\.catch\(e => \{\}\);\s*\} catch\(err\)\{\}/g,
  "setCurrentIndex($1);"
);

// We should only intercept the onClick handlers for Previous and Next
code = code.replace(
  /onClick=\{\(\) => setCurrentIndex\(prev => Math\.max\(0, prev - 1\)\)\}/g,
  `onClick={() => {
                  const newVal = Math.max(0, currentIndex - 1);
                  setCurrentIndex(newVal);
                  setDoc(doc(db, 'settings', 'sync'), { activeIndex: newVal }, { merge: true }).catch(e => {});
                }}`
);

code = code.replace(
  /onClick=\{\(\) => setCurrentIndex\(prev => Math\.min\(parsedData\.length - 1, prev \+ 1\)\)\}/g,
  `onClick={() => {
                  const newVal = Math.min(parsedData.length - 1, currentIndex + 1);
                  setCurrentIndex(newVal);
                  setDoc(doc(db, 'settings', 'sync'), { activeIndex: newVal }, { merge: true }).catch(e => {});
                }}`
);

// Also the select dropdown
code = code.replace(
  /onChange=\{\(e\) => setCurrentIndex\(Number\(e\.target\.value\)\)\}/g,
  `onChange={(e) => {
                  const newVal = Number(e.target.value);
                  setCurrentIndex(newVal);
                  setDoc(doc(db, 'settings', 'sync'), { activeIndex: newVal }, { merge: true }).catch(e => {});
                }}`
);

// Also inside handleDeleteUser
code = code.replace(
  /setCurrentIndex\(prev => Math\.max\(0, prev - 1\)\);/g,
  `const newVal = Math.max(0, currentIndex - 1);
                          setCurrentIndex(newVal);
                          setDoc(doc(db, 'settings', 'sync'), { activeIndex: newVal }, { merge: true }).catch(e => {});`
);

// Any other simple setCurrentIndex(0) etc.
code = code.replace(
  /setCurrentIndex\(([^)]+)\);/g,
  (match, p1) => {
    if (p1.includes('=>') || p1.includes('activeIndex') || p1.includes('newVal')) return match;
    return `setCurrentIndex(${p1});
    setDoc(doc(db, 'settings', 'sync'), { activeIndex: ${p1} }, { merge: true }).catch(e => {});`;
  }
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed syntax error.");
