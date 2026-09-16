const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  "hmr: false",
  "hmr: process.env.DISABLE_HMR !== 'true'"
);

fs.writeFileSync('vite.config.ts', code);
console.log("Restored vite.config.ts");
