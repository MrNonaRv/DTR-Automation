const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldStorage = `const safeStorage = {
  getItem: (key) => {
    try { return safeStorage.getItem(key); } catch(e) { return null; }
  },
  setItem: (key, value) => {
    try { safeStorage.setItem(key, value); } catch(e) {}
  },
  removeItem: (key) => {
    try { safeStorage.removeItem(key); } catch(e) {}
  }
};`;

const newStorage = `const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch(e) { return null; }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, value); } catch(e) {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch(e) {}
  }
};`;

code = code.replace(oldStorage, newStorage);
fs.writeFileSync('src/App.tsx', code);
console.log("Fixed infinite loop in safeStorage");
