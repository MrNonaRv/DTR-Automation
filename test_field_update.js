const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Also sync showEditor so that if one device enters the editor, all devices do.
code = code.replace(
  /setShowEditor\(true\);/,
  `setShowEditor(true);
              setDoc(doc(db, 'settings', 'sync'), { isEditorOpen: true }, { merge: true }).catch(e => {});`
);

code = code.replace(
  /if \(data\.activeSessionId && data\.activeSessionId !== currentSessionId\) \{/,
  `if (data.isEditorOpen !== undefined && !showEditor && data.isEditorOpen) {
          setShowEditor(true);
        }
        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {`
);

// We need to pass showEditor into the dependency array of settings/sync?
// Actually we can just use set state functional update.
code = code.replace(
  /if \(data\.isEditorOpen !== undefined && !showEditor && data\.isEditorOpen\) \{\s*setShowEditor\(true\);\s*\}/,
  `if (data.isEditorOpen !== undefined) {
          setShowEditor(prev => {
            if (!prev && data.isEditorOpen) return true;
            return prev;
          });
        }`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched showEditor sync.");
