const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf-8');
console.log(code.includes("setAutoSaveStatus('idle')"));
