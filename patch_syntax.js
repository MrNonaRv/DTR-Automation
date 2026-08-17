const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Use simple replace for the literal \n text that was inserted
code = code.replace(/useState\<'straight' \| 'normal'\>\('straight'\);\\n  const \[autoFillSchedule, setAutoFillSchedule\]/, "useState<'straight' | 'normal'>('straight');\n  const [autoFillSchedule, setAutoFillSchedule]");

fs.writeFileSync('src/App.tsx', code);
