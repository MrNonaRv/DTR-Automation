const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetImport = `import { Toast } from './components/Toast';`;
const replaceImport = `import { Toast } from './components/Toast';\nimport { PWAInstallButton } from './components/PWAInstallButton';`;
code = code.replace(targetImport, replaceImport);

const targetHeader = `          <div className="flex items-center space-x-4">
            {updateAvailable && (`;

const replaceHeader = `          <div className="flex items-center space-x-4">
            <PWAInstallButton />
            {updateAvailable && (`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, replaceHeader);
  fs.writeFileSync('src/App.tsx', code);
  console.log('patched install button');
} else {
  console.log('could not find header target');
}
