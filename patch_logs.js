const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(
  'if (newDataString !== prevDataString) {',
  'if (newDataString !== prevDataString) {\n            console.log("App: Cloud update received! Data differs.");'
);
fs.writeFileSync('src/App.tsx', appCode);

let dtrCode = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');
dtrCode = dtrCode.replace(
  '// ONLY overwrite if the user isn\'t actively typing/unsaved',
  'console.log("DTREditor: employee prop changed. isSaved:", isSaved);\n    // ONLY overwrite if the user isn\'t actively typing/unsaved'
);
fs.writeFileSync('src/components/DTREditor.tsx', dtrCode);
console.log("Patched logs");
