const fs = require('fs');

let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace(/showToast\('No worksheet found in the file\.'\);/g, "alert('No worksheet found in the file.');");
content = content.replace(/showToast\(\`\$\{data\[key\]\.label\} list imported\`\);/g, "alert(`${data[key].label} list imported from ${file.name}`);");
content = content.replace(/showToast\('Failed to import file'\);/g, "alert('Failed to import file');");
content = content.replace(/id: uid\(\)/g, "id: Math.random().toString(36).slice(2, 10)");

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed ScannerTool.tsx successfully');
