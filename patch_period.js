const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetPeriodState = `  const [period, setPeriod] = useState<string>(() => {
    try {
      let saved = null; try { saved = localStorage.getItem('dtr_period'); } catch(e) {}
      if (saved) return saved;
    } catch(e) {}
    const now = new Date();
    return \`\${now.getFullYear()}-\${(now.getMonth() + 1).toString().padStart(2, '0')}\`;
  }); // YYYY-MM format`;

const replacePeriodState = `  const [period, setPeriod] = useState<string>(() => {
    const now = new Date();
    return \`\${now.getFullYear()}-\${(now.getMonth() + 1).toString().padStart(2, '0')}\`;
  }); // YYYY-MM format`;

code = code.replace(targetPeriodState, replacePeriodState);

const targetPeriodStorage = `  useEffect(() => {
    if (period) { try { localStorage.setItem('dtr_period', period); } catch(e) {} }
  }, [period]);`;

code = code.replace(targetPeriodStorage, '');

fs.writeFileSync('src/App.tsx', code);
console.log('patched period detection');
