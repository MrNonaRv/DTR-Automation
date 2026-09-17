const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add reading session ID from URL in initial state
code = code.replace(
  "const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => { try { return localStorage.getItem('dtr_sessionId'); } catch(e) { return null; } });",
  `const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => { 
    try { 
      const urlParams = new URLSearchParams(window.location.search);
      const urlSession = urlParams.get('session');
      if (urlSession) {
        localStorage.setItem('dtr_sessionId', urlSession);
        return urlSession;
      }
      return localStorage.getItem('dtr_sessionId'); 
    } catch(e) { return null; } 
  });`
);

// 2. Clear URL parameter after reading it so it doesn't get stuck if they load another one
const clearUrlCode = `  useEffect(() => {
    if (window.location.search.includes('session=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
`;
code = code.replace("const [autoSaveStatus, setAutoSaveStatus] = useState", clearUrlCode + "\n  const [autoSaveStatus, setAutoSaveStatus] = useState");


fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for URL params');
