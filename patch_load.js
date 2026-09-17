const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "setParsedData(session.data);",
  "setCurrentSessionId(session.id);\n                              setCurrentSessionName(session.name);\n                              setParsedData(session.data);"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for loading session');
