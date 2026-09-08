const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchState = `  const [showScannerTool, setShowScannerTool] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEditor, setShowEditor] = useState(() => {
    return !!localStorage.getItem('dtr_parsedData');
  });`;

const replaceState = `  const [showScannerTool, setShowScannerTool] = useState(() => sessionStorage.getItem('dtr_route') === 'scanner');
  const [showUploadUI, setShowUploadUI] = useState(() => sessionStorage.getItem('dtr_route') === 'upload');
  const [showHelp, setShowHelp] = useState(false);
  const [showEditor, setShowEditor] = useState(() => sessionStorage.getItem('dtr_route') === 'editor');
  
  useEffect(() => {
    if (showScannerTool) {
      sessionStorage.setItem('dtr_route', 'scanner');
    } else if (showEditor) {
      sessionStorage.setItem('dtr_route', 'editor');
    } else if (showUploadUI) {
      sessionStorage.setItem('dtr_route', 'upload');
    } else {
      sessionStorage.removeItem('dtr_route');
    }
  }, [showScannerTool, showEditor, showUploadUI]);`;

if (code.includes(searchState)) {
  code = code.replace(searchState, replaceState);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched successfully.");
} else {
  console.log("Could not find search string.");
}
