const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const [showScannerTool, setShowScannerTool] = useState(() => { try { return sessionStorage.getItem('dtr_route') === 'scanner'; } catch(e) { return false; } });",
  "const [showScannerTool, setShowScannerTool] = useState(() => { try { return sessionStorage.getItem('dtr_route') === 'scanner'; } catch(e) { return false; } });\n  const [showAllSessionsModal, setShowAllSessionsModal] = useState(false);"
);

fs.writeFileSync('src/App.tsx', code);
console.log('State added');
