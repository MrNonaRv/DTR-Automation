const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');
code = code.replace(
  "hmr: { overlay: false },",
  "hmr: process.env.DISABLE_HMR !== 'true',"
);
fs.writeFileSync('vite.config.ts', code);
console.log('patched vite config back to default');
