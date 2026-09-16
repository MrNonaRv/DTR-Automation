const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("\\nexport default function App() {", "export default function App() {");

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed syntax error");
