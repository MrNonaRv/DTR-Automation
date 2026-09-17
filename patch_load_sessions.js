const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `const sessions = snap.docs.map(d => {
        const docData = d.data();
        let dataArray = [];
        if (docData.dataMap) {
          Object.keys(docData.dataMap).forEach(k => dataArray[Number(k)] = docData.dataMap[k]);
        } else if (docData.data) {
          dataArray = docData.data;
        }
        return { id: d.id, ...docData, data: dataArray };
      });`;
      
code = code.replace("const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));", replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for load sessions mapping');
