const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

const reloadScript = `
    <!-- Auto-reloader for Vite Dev Server -->
    <script>
      if (window.location.hostname !== 'localhost') {
        const originalConsoleError = console.error;
        console.error = function(...args) {
          if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('[vite]')) {
            // Suppress the console error
            // If it's a disconnect, wait 2 seconds and auto-refresh
            if (args[0].includes('server connection lost') || args[0].includes('connecting...')) {
              setTimeout(() => window.location.reload(), 2500);
            }
            return;
          }
          originalConsoleError.apply(console, args);
        };
      }
    </script>
`;

html = html.replace('</head>', reloadScript + '</head>');
fs.writeFileSync('index.html', html);
