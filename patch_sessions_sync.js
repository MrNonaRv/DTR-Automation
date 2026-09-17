const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetMethod = `  const loadSavedSessions = async () => {
    try {
      const q = query(collection(db, 'dtr_sessions'), orderBy('updatedAt', 'desc'), limit(15));
      const snap = await getDocs(q);
      const sessions = snap.docs.map(d => {
        const docData = d.data();
        let dataArray = [];
        if (docData.dataMap) {
          Object.keys(docData.dataMap).forEach(k => dataArray[Number(k)] = docData.dataMap[k]);
        } else if (docData.data) {
          dataArray = docData.data;
        }
        return { id: d.id, ...docData, data: dataArray };
      });
      setSavedSessions(sessions);
    } catch (e) {
      console.error("Failed to load saved sessions", e);
    }
  };

  useEffect(() => {
    loadSavedSessions();
  }, []);`;

const replacement = `  // Use a real-time listener for the sessions list so it updates instantly across devices
  useEffect(() => {
    const q = query(collection(db, 'dtr_sessions'), orderBy('updatedAt', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snap) => {
      const sessions = snap.docs.map(d => {
        const docData = d.data();
        let dataArray = [];
        if (docData.dataMap) {
          Object.keys(docData.dataMap).forEach(k => dataArray[Number(k)] = docData.dataMap[k]);
        } else if (docData.data) {
          dataArray = docData.data;
        }
        return { id: d.id, ...docData, data: dataArray };
      });
      setSavedSessions(sessions);
    }, (e) => {
      console.error("Failed to load saved sessions", e);
    });
    return () => unsubscribe();
  }, []);

  const loadSavedSessions = () => {}; // Stub out old method if referenced elsewhere`;

code = code.replace(targetMethod, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('patched sessions sync');
