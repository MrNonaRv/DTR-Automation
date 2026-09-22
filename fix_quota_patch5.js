const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  `} catch (e) {
          console.error("Failed to load no_biometric config", e);
        }`,
  `} catch (e: any) {
          if (e.message && e.message.includes("Quota")) {
             setToast({ message: "Firebase read quota exceeded. Cannot fetch non-biometric list.", type: "error" });
          } else {
             console.error("Failed to load no_biometric config", e);
          }
        }`
);
fs.writeFileSync('src/App.tsx', code);
console.log('fixed 5');
