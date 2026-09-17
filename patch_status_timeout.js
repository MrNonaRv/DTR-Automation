const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "setTimeout(() => setAutoSaveStatus('idle'), 2000);",
  "setTimeout(() => setAutoSaveStatus('idle'), 500);"
);

// We need to replace it globally since there might be multiple instances
code = code.replace(/setTimeout\(\(\) => setAutoSaveStatus\('idle'\), 2000\);/g, "setTimeout(() => setAutoSaveStatus('idle'), 500);");

fs.writeFileSync('src/App.tsx', code);
console.log('Timeout patched');
