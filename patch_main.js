const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

code = code.replace("const updateSW = registerSW", "try { const updateSW = registerSW({ onNeedRefresh() {}, onOfflineReady() {} }); } catch(e) { console.error('SW Error:', e); }; //");
fs.writeFileSync('src/main.tsx', code);
