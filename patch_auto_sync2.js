const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "setParsedData(sessionData.data);",
  `let serverDataArray = [];
              if (sessionData.dataMap) {
                Object.keys(sessionData.dataMap).forEach(k => serverDataArray[Number(k)] = sessionData.dataMap[k]);
              } else if (sessionData.data) {
                serverDataArray = sessionData.data;
              }
              setParsedData(serverDataArray);`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for auto sync mapping');
