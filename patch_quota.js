const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Patch 1: settings/sync
code = code.replace(
  `}
    });
    return () => unsub();
  }, []);`,
  `}
    }, (e) => {
      if (e.message && e.message.includes("Quota")) {
        setToast({ message: "Firebase quota exceeded. Cloud Sync disabled.", type: "error" });
      } else {
        console.error("settings/sync error", e);
      }
    });
    return () => unsub();
  }, []);`
);

// Patch 2: dtr_sessions/currentSessionId
code = code.replace(
  `      }
    });
    return () => unsub();
  }, [currentSessionId]);`,
  `      }
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

// Patch 3: collection dtr_sessions
code = code.replace(
  `    }, (e) => {
      console.error("Failed to load saved sessions", e);
    });`,
  `    }, (e) => {
      if (e.message && e.message.includes("Quota")) {
        setToast({ message: "Cloud quota exceeded. Some online features may be unavailable.", type: "error" });
      }
      console.error("Failed to load saved sessions", e);
    });`
);

// We also have to be careful not to spam the user with 3 toasts simultaneously.
// But it's okay, they will just stack or one will show.

fs.writeFileSync('src/App.tsx', code);
console.log('patched');
