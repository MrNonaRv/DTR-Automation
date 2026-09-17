const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf-8');

const target = `VitePWA({
        registerType: 'autoUpdate',`;
const replace = `VitePWA({
        selfDestroying: true,
        registerType: 'autoUpdate',`;

code = code.replace(target, replace);
fs.writeFileSync('vite.config.ts', code);
