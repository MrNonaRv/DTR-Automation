const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = 'setCurrentSessionName(prev => prev !== data.name ? data.name : prev);\n      }\n    });\n    return () => unsub();\n  }, [currentSessionId]);';
const replacement = 'setCurrentSessionName(prev => prev !== data.name ? data.name : prev);\n      }\n    }, (e) => {\n      if (e.message && e.message.includes("Quota")) {\n        setToast({ message: "Firebase quota exceeded. Real-time updates disabled.", type: "error" });\n      } else {\n        console.error("dtr_sessions sync error", e);\n      }\n    });\n    return () => unsub();\n  }, [currentSessionId]);';

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log('fixed 2');
