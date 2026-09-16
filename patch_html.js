const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const unregisterScript = `
    <script>
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
            console.log('Service Worker unregistered');
          }
        });
      }
      // Also clear all caches to be safe
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names)
            caches.delete(name);
        });
      }
    </script>
`;

code = code.replace('<div id="root"></div>', unregisterScript + '\\n    <div id="root"></div>');
fs.writeFileSync('index.html', code);
console.log("Patched index.html");
