const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const storageHelper = `
const safeStorage = {
  getItem: (key) => {
    try { return localStorage.getItem(key); } catch(e) { return null; }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, value); } catch(e) {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch(e) {}
  }
};
`;

code = code.replace("export default function App() {", storageHelper + "\\nexport default function App() {");
code = code.replace(/localStorage\.getItem/g, "safeStorage.getItem");
code = code.replace(/localStorage\.setItem/g, "safeStorage.setItem");
code = code.replace(/localStorage\.removeItem/g, "safeStorage.removeItem");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched localStorage");
