const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const errScript = `
<script>
  window.addEventListener('error', function(e) {
    document.body.innerHTML += '<div style="position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:20px;">' + e.message + '<br/>' + e.filename + ':' + e.lineno + '</div>';
  });
</script>
`;

code = code.replace('<head>', '<head>' + errScript);
fs.writeFileSync('index.html', code);
