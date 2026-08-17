const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Initialize from localStorage
const parsedDataStateRegex = /const \[parsedData, setParsedData\] = useState<EmployeeAttendance\[\] \| null>\(null\);/;
if (parsedDataStateRegex.test(code)) {
    code = code.replace(parsedDataStateRegex, `const [parsedData, setParsedData] = useState<EmployeeAttendance[] | null>(() => {
    try {
      const saved = localStorage.getItem('dtr_parsedData');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load parsedData from localStorage', e);
    }
    return null;
  });`);
}

// 3. Keep showEditor open on refresh if parsedData is there.
const showEditorRegex = /const \[showEditor, setShowEditor\] = useState\(false\);/;
if (showEditorRegex.test(code)) {
    code = code.replace(showEditorRegex, `const [showEditor, setShowEditor] = useState(() => {
    return !!localStorage.getItem('dtr_parsedData');
  });`);
}

// Also persist period?
const periodRegex = /const \[period, setPeriod\] = useState<string>\(\(\) => \{/;
if (periodRegex.test(code)) {
    code = code.replace(periodRegex, `const [period, setPeriod] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('dtr_period');
      if (saved) return saved;
    } catch(e) {}`);
}

const effectToAdd = `
  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('dtr_parsedData', JSON.stringify(parsedData));
    } else {
      localStorage.removeItem('dtr_parsedData');
    }
  }, [parsedData]);
  
  useEffect(() => {
    if (period) localStorage.setItem('dtr_period', period);
  }, [period]);
`;
code = code.replace("const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);", effectToAdd + "\n  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);");

fs.writeFileSync('src/App.tsx', code);
console.log("Persistence patched!");
