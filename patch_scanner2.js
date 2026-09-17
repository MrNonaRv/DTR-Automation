const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf-8');

// I need to track saveStatus inside the effect. 
// But saveStatus is a React state. In the effect, it's captured on mount. 
// I should use a ref for saveStatus.

const refCode = `
  const [saveStatus, setSaveStatus] = useState<Record<ScannerKey, 'saved' | 'unsaved' | 'saving'>>({
    scanner1: 'saved',
    scanner2: 'saved',
    no_biometric: 'saved'
  });
  
  const saveStatusRef = useRef(saveStatus);
  useEffect(() => {
    saveStatusRef.current = saveStatus;
  }, [saveStatus]);
`;

code = code.replace(
  `  const [saveStatus, setSaveStatus] = useState<Record<ScannerKey, 'saved' | 'unsaved' | 'saving'>>({
    scanner1: 'saved',
    scanner2: 'saved',
    no_biometric: 'saved'
  });`,
  refCode
);

const oldEffect = `        if (docSnap.exists()) {
          const parsed = docSnap.data();
          setData(prev => ({
            ...prev,
            [key]: {
              label: parsed.label || DEFAULT_LABELS[key],
              people: Array.isArray(parsed.people) ? parsed.people : []
            }
          }));
        }`;

const newEffect = `        if (docSnap.exists()) {
          const parsed = docSnap.data();
          
          // ONLY apply incoming cloud updates if this device is NOT actively editing/saving that specific scanner
          if (saveStatusRef.current[key] === 'saved') {
            setData(prev => ({
              ...prev,
              [key]: {
                label: parsed.label || DEFAULT_LABELS[key],
                people: Array.isArray(parsed.people) ? parsed.people : []
              }
            }));
          }
        }`;

code = code.replace(oldEffect, newEffect);

fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log('patched scanner again');
