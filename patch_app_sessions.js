const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for savedSessions and isSaving
const stateRegex = /const \[isCreatingBlank, setIsCreatingBlank\] = useState\(false\);/;
code = code.replace(stateRegex, "const [isCreatingBlank, setIsCreatingBlank] = useState(false);\n  const [savedSessions, setSavedSessions] = useState<any[]>([]);\n  const [isSaving, setIsSaving] = useState(false);");

// 2. Fetch saved sessions on load
const useEffectRegex = /useEffect\(\(\) => \{\s*if \(period\) localStorage.setItem\('dtr_period', period\);\s*\}, \[period\]\);/;
const fetchSessionsCode = `useEffect(() => {
    if (period) localStorage.setItem('dtr_period', period);
  }, [period]);

  const loadSavedSessions = async () => {
    try {
      const q = query(collection(db, 'dtr_sessions'), orderBy('updatedAt', 'desc'), limit(5));
      const snap = await getDocs(q);
      const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSavedSessions(sessions);
    } catch (e) {
      console.error("Failed to load saved sessions", e);
    }
  };

  useEffect(() => {
    loadSavedSessions();
  }, []);`;
code = code.replace(useEffectRegex, fetchSessionsCode);

// 3. Add 'Save Progress' button
const saveBtnRegex = /<button \s*onClick=\{async \(\) => \{\s*const newRef = doc\(collection\(db, 'dtr_records'\)\);/;
const saveBtnReplacement = `<button
                      onClick={async () => {
                        const sessionName = prompt("Enter a name for this session (e.g. 'Aug 2026')");
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
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      {isSaving ? "Saving..." : "Save to Cloud"}
                    </button>
                    <button 
                      onClick={async () => {
                        const newRef = doc(collection(db, 'dtr_records'));`;
code = code.replace(saveBtnRegex, saveBtnReplacement);

// 4. Add "Save" icon import
if (!code.includes("Save, ")) {
  code = code.replace("Settings, ", "Settings, Save, ");
}

// 5. Display recent sessions on the home page
const recentSessionsRegex = /<\/div>\s*\{parsedData && parsedData\.length > 0 \? \(/;
const recentSessionsHTML = `</div>

                {savedSessions.length > 0 && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Recent Saved DTRs</h4>
                    <div className="space-y-2">
                      {savedSessions.map(session => (
                        <button
                          key={session.id}
                          onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                            }
                          }}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">{session.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{session.data?.length || 0} records</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {parsedData && parsedData.length > 0 ? (`
code = code.replace(recentSessionsRegex, recentSessionsHTML);

// 6. Make sure to import query, orderBy, limit, getDocs from firestore if not there
if (!code.includes("getDocs")) {
  code = code.replace(
    "import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';",
    "import { collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';"
  );
}


fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with sessions!");
