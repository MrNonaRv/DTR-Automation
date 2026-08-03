const fs = require('fs');

function replaceInFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(
    "const { fileData } = req.body;",
    "console.log('req.body:', typeof req.body === 'string' ? req.body.substring(0, 100) : Object.keys(req.body));\n    const { fileData } = req.body;"
  );
  fs.writeFileSync(path, content);
}
replaceInFile('api/index.ts');
replaceInFile('server.ts');
console.log('Added logging');
