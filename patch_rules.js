const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
  "match /scanner_configs/{configId} {",
  "match /dtr_sessions/{sessionId} {\n      allow read, write: if true;\n    }\n\n    match /scanner_configs/{configId} {"
);
fs.writeFileSync('firestore.rules', code);
console.log("Patched firestore rules!");
