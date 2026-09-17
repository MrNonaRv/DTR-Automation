const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the onSnapshot lock block:
// if (docSnap.metadata.hasPendingWrites) return;
code = code.replace(
  "        // Ignore local writes that haven't been committed yet to avoid jitter/feedback loops\n        if (docSnap.metadata.hasPendingWrites) return;",
  ""
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched to remove pendingWrites lock');
