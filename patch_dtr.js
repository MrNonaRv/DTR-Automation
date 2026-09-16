const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `              {parsedData.length > 0 && (
                <DTREditor`;
const replace = `              {parsedData.length > 0 && parsedData[currentIndex] && (
                <DTREditor`;

code = code.replace(search, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
