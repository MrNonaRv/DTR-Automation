const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetCatch = `    } catch(e) {
      console.error(e);
      setAutoSaveStatus('idle');
    }`;

const replaceCatch = `    } catch(e: any) {
      console.error(e);
      setAutoSaveStatus('idle');
      setToast({ message: "Failed to save session to cloud. File may be too large.", type: "error" });
    }`;

code = code.replace(targetCatch, replaceCatch);

fs.writeFileSync('src/App.tsx', code);
