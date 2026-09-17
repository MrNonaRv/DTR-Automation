const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetImport = `import { PWAInstallButton } from './components/PWAInstallButton';`;
const replaceImport = `import { PWAInstallButton } from './components/PWAInstallButton';\nimport { OfflineIndicator } from './components/OfflineIndicator';`;
code = code.replace(targetImport, replaceImport);

const targetReturn = `  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-blue-100">`;

const replaceReturn = `  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-blue-100">
      <OfflineIndicator />`;

if (code.includes(targetReturn)) {
  code = code.replace(targetReturn, replaceReturn);
  fs.writeFileSync('src/App.tsx', code);
  console.log('patched offline indicator');
} else {
  console.log('could not find return target');
}
