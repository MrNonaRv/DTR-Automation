const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const targetUnregister = `// Force unregister all old service workers to fix cache issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}`;

code = code.replace(targetUnregister, '');
fs.writeFileSync('src/main.tsx', code);
console.log('patched main');
