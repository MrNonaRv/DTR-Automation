const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');
code = code.replace(
  "hmr: process.env.DISABLE_HMR !== 'true',",
  "hmr: process.env.DISABLE_HMR !== 'true' ? { overlay: false } : false,"
);
fs.writeFileSync('vite.config.ts', code);
