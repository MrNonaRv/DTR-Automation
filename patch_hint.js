const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

code = code.replace(
  /<div className="mb-8">\s*<label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider mb-3">1 &mdash; Which scanner is this file from\?<\/label>\s*<div className="flex flex-col sm:flex-row gap-4">/m,
  `<div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">1 &mdash; Which scanner is this file from?</label>
              </div>
              <p className="text-sm text-gray-500 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-700">Heads up:</strong> Biometric <code className="font-mono text-xs">.dat</code> files only contain ID numbers. To see real names in your Excel export, ensure you've filled out the roster in the corresponding <strong>Scanner Tab</strong> above before converting!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">`
);

fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched!");
