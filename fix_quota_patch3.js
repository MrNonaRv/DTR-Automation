const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /setCurrentSessionName\((.+)\);\n\s*}\n\s*}\);\n\s*return \(\) => unsub\(\);\n\s*\}, \[currentSessionId\]\);/g,
  `setCurrentSessionName($1);
      }
    }, (e) => {
      if (e.message && e.message.includes("Quota")) {
        setToast({ message: "Firebase quota exceeded. Real-time updates disabled.", type: "error" });
      } else {
        console.error("dtr_sessions sync error", e);
      }
    });
    return () => unsub();
  }, [currentSessionId]);`
);
fs.writeFileSync('src/App.tsx', code);
console.log('fixed 3');
