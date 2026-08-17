const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import HelpGuide")) {
  code = code.replace(
    "import { DTREditor } from './components/DTREditor';",
    "import { DTREditor } from './components/DTREditor';\nimport HelpGuide from './components/HelpGuide';"
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched HelpGuide import!");
} else {
  console.log("Already imported.");
}
