const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /        setPeriod\(prev => prev !== data\.period \? data\.period : prev\);\n        setCurrentSessionName\(prev => prev !== data\.name \? data\.name : prev\);\n      \}\n    \}\);\n\n        setPeriod\(prev => prev !== data\.period \? data\.period : prev\);\n        setCurrentSessionName\(prev => prev !== data\.name \? data\.name : prev\);\n      \}\n    \}\);/m;

const replacement = `        setPeriod(prev => prev !== data.period ? data.period : prev);
        setCurrentSessionName(prev => prev !== data.name ? data.name : prev);
      }
    });`;
    
code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx syntax fixed');
