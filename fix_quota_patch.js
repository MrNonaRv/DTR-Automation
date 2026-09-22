const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `    }, (e) => {
      if (e.message && e.message.includes("Quota")) {
        setToast({ message: "Firebase quota exceeded. Real-time updates disabled.", type: "error" });
      } else {
        console.error("dtr_sessions sync error", e);
      }
    });
    return () => unsub();
  }, [currentSessionId]);`,
  `    }, (e) => {
      if (e.message && e.message.includes("Quota")) {
        setToast({ message: "Firebase quota exceeded. Cloud Sync disabled.", type: "error" });
      } else {
        console.error("settings/sync error", e);
      }
    });
    return () => unsub();
  }, [currentSessionId]);`
);

code = code.replace(
  `        setCurrentSessionName(prev => prev !== data.name ? data.name : prev);
      }
    });
    return () => unsub();
  }, [currentSessionId]);`,
  `        setCurrentSessionName(prev => prev !== data.name ? data.name : prev);
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
console.log('fixed');
