const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

code = code.replace(/} catch \(e\) {/g, "} catch (e: any) {");

code = code.replace(
  /setToast\(\{ message: 'Failed to sync to cloud', type: 'error' \}\);/g,
  `if (e?.code === 'resource-exhausted' || e?.message?.includes('Quota')) {
        setToast({ message: 'Firebase daily quota exceeded. Data saved locally.', type: 'error' });
      } else {
        setToast({ message: 'Failed to sync to cloud', type: 'error' });
      }`
);

fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched ScannerTool");
