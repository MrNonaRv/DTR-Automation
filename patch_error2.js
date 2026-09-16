const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const errScript = `
  window.addEventListener('unhandledrejection', function(e) {
    document.body.innerHTML += '<div style="position:fixed;top:50px;left:0;z-index:9999;background:orange;color:black;padding:20px;">' + (e.reason ? e.reason.message || e.reason : 'unhandled rejection') + '</div>';
  });
`;

code = code.replace('</script>', errScript + '</script>');
fs.writeFileSync('index.html', code);
