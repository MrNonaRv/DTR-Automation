const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("Printer")) {
  code = code.replace(
    "import { UploadCloud, Save, HelpCircle",
    "import { UploadCloud, Save, HelpCircle, Printer"
  );
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Printer import!");
