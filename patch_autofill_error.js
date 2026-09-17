const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetCatch = `      }).catch((e: any) => console.error(e));
    }
    
    setAutoFillTrigger(prev => prev + 1);`;

const replaceCatch = `      }).catch((e: any) => {
        console.error(e);
        setToast({ message: "Failed to sync to cloud. The data might be too large.", type: "error" });
      });
    }
    
    setAutoFillTrigger(prev => prev + 1);`;

code = code.replace(targetCatch, replaceCatch);

fs.writeFileSync('src/App.tsx', code);
