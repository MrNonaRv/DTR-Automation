const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

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
  console.log("Auto-save button successfully implemented!");
} else {
  console.log("Still could not find the Save button. Regex issue.");
}
