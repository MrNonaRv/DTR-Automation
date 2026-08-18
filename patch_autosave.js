const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add session states
const stateInjection = `  const [file, setFile] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => localStorage.getItem('dtr_sessionId'));
  const [currentSessionName, setCurrentSessionName] = useState<string>(() => localStorage.getItem('dtr_sessionName') || '');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');`;

code = code.replace("  const [file, setFile] = useState<File | null>(null);", stateInjection);

// 2. Modify localStorage sync
const localStorageSearch = `  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('dtr_parsedData', JSON.stringify(parsedData));
    } else {
      localStorage.removeItem('dtr_parsedData');
    }
  }, [parsedData]);`;

const localStorageReplace = `  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('dtr_parsedData', JSON.stringify(parsedData));
      if (currentSessionId) localStorage.setItem('dtr_sessionId', currentSessionId);
      if (currentSessionName) localStorage.setItem('dtr_sessionName', currentSessionName);
    } else {
      localStorage.removeItem('dtr_parsedData');
      localStorage.removeItem('dtr_sessionId');
      localStorage.removeItem('dtr_sessionName');
    }
  }, [parsedData, currentSessionId, currentSessionName]);`;

code = code.replace(localStorageSearch, localStorageReplace);

// 3. Add Auto-save effect
const autoSaveEffect = `
  useEffect(() => {
    if (!parsedData || !currentSessionId) return;

    setAutoSaveStatus('saving');
    const timeoutId = setTimeout(async () => {
      try {
        await setDoc(doc(collection(db, 'dtr_sessions'), currentSessionId), {
          name: currentSessionName || "Auto-saved Session",
          period: period,
          data: parsedData,
          updatedAt: serverTimestamp()
        });
        setAutoSaveStatus('saved');
        loadSavedSessions();
      } catch (e) {
        console.error("Auto-save failed", e);
        setAutoSaveStatus('idle');
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timeoutId);
  }, [parsedData, period, currentSessionId, currentSessionName]);
`;
code = code.replace("  const loadSavedSessions = async () => {", autoSaveEffect + "\n  const loadSavedSessions = async () => {");


// 4. Update file upload to create session immediately
const uploadSearch = `      setParsedData(formattedData);
      
      setToast({ message: 'DTR Data uploaded successfully.', type: 'success' });`;

const uploadReplace = `      setParsedData(formattedData);
      
      const newFileName = file.name.replace(/\\.[^/.]+$/, "");
      setCurrentSessionName(newFileName);
      setCurrentSessionId(Date.now().toString());

      setToast({ message: 'DTR Data uploaded successfully. Auto-save is ON.', type: 'success' });`;

code = code.replace(uploadSearch, uploadReplace);

// 5. Update loading a session from the list
const loadSessionSearch = `                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);`;
const loadSessionReplace = `                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setShowEditor(true);`;
code = code.replace(loadSessionSearch, loadSessionReplace);

// 6. Replace "Save to Cloud" button with AutoSave indicator and Rename button
const saveBtnSearch = `                    <button 
                      onClick={async () => {
                        const defaultName = period ? \`DTR: \${period}\` : \`My Saved DTR (\${new Date().toLocaleDateString()})\`;
                        const sessionName = prompt("Save your work online so you don't lose it!\\n\\nName this file:", defaultName);
                        if (!sessionName) return;
                        setIsSaving(true);
                        try {
                          await setDoc(doc(collection(db, 'dtr_sessions'), Date.now().toString()), {
                            name: sessionName,
                            period: period,
                            data: parsedData,
                            updatedAt: serverTimestamp()
                          });
                          setToast({ message: "Progress saved to cloud!", type: "success" });
                          loadSavedSessions();
                        } catch (e) {
                          setToast({ message: "Failed to save progress.", type: "error" });
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      {isSaving ? "Saving..." : "Save to Cloud"}
                    </button>`;

const saveBtnReplace = `                    <button 
                      onClick={() => {
                        const newName = prompt("Rename your saved file:", currentSessionName);
                        if (newName) {
                          setCurrentSessionName(newName);
                          setToast({ message: "File renamed! Auto-saving...", type: "success" });
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-green-200 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1.5 text-green-600" />
                      {autoSaveStatus === 'saving' ? "Saving to Cloud..." : autoSaveStatus === 'saved' ? \`Cloud Saved: \${currentSessionName}\` : "Rename File"}
                    </button>`;

if (code.includes(saveBtnSearch)) {
  code = code.replace(saveBtnSearch, saveBtnReplace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Auto-save successfully implemented!");
} else {
  console.log("Could not find the Save button to replace.");
}
