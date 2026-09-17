const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `          if (newDataString !== prevDataString) {
            setToast({ message: "Cloud update received!", type: "info" });
            return serverDataArray;
          }`;
const replace = `          if (newDataString !== prevDataString) {
            return serverDataArray;
          }`;

code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
