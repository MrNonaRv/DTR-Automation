const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf-8');

const targetMethod = `  useEffect(() => {
    // Load from firestore
    const loadData = async () => {
      const loaded = { ...data };
      for (const key of SCANNER_KEYS) {
        try {
          const docSnap = await getDoc(doc(db, 'scanner_configs', key));
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            loaded[key] = {
              label: parsed.label || DEFAULT_LABELS[key],
              people: Array.isArray(parsed.people) ? parsed.people : []
            };
          }
        } catch (e: any) {
          console.error("Failed to load scanner config", e);
        }
      }
      setData(loaded);
      
      try {
        const recentSnap = await getDoc(doc(db, 'scanner_configs', 'recent_files_v1'));
        if (recentSnap.exists()) {
          const parsedRecent = recentSnap.data();
          if (Array.isArray(parsedRecent.files)) {
            setRecentFiles(parsedRecent.files);
          }
        }
      } catch (e: any) {
        console.error("Failed to load recent files config", e);
      }
    };
    loadData();
  }, []);`;

const replacement = `  useEffect(() => {
    // Real-time listener for scanner configs
    const unsubscribers = SCANNER_KEYS.map((key) => {
      return onSnapshot(doc(db, 'scanner_configs', key), (docSnap) => {
        if (docSnap.exists()) {
          const parsed = docSnap.data();
          setData(prev => ({
            ...prev,
            [key]: {
              label: parsed.label || DEFAULT_LABELS[key],
              people: Array.isArray(parsed.people) ? parsed.people : []
            }
          }));
        }
      }, (err) => {
        console.error("Failed to sync scanner config", err);
      });
    });

    const recentUnsub = onSnapshot(doc(db, 'scanner_configs', 'recent_files_v1'), (recentSnap) => {
      if (recentSnap.exists()) {
        const parsedRecent = recentSnap.data();
        if (Array.isArray(parsedRecent.files)) {
          setRecentFiles(parsedRecent.files);
        }
      }
    });
    unsubscribers.push(recentUnsub);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);`;

code = code.replace(targetMethod, replacement);
fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log('patched scanner');
