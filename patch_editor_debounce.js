const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

code = code.replace(
  "      }, 1000);",
  "      }, 300);"
);

fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('DTREditor debounce fixed');
