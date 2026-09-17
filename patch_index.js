const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(/<script>\s*\/\/ Emergency PWA Cache Clear[\s\S]*?<\/script>/, '');

fs.writeFileSync('index.html', html);
console.log('Cleaned index.html');
