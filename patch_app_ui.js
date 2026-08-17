const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import HelpGuide and HelpCircle icon
if (!code.includes("import HelpGuide")) {
  code = code.replace(
    "import DTREditor from './components/DTREditor';",
    "import DTREditor from './components/DTREditor';\nimport HelpGuide from './components/HelpGuide';"
  );
}
if (!code.includes("HelpCircle")) {
  code = code.replace("import { UploadCloud, Save", "import { UploadCloud, Save, HelpCircle");
}

// Add state for HelpGuide
if (!code.includes("const [showHelp, setShowHelp] = useState(false);")) {
  code = code.replace(
    "const [showEditor, setShowEditor] = useState",
    "const [showHelp, setShowHelp] = useState(false);\n  const [showEditor, setShowEditor] = useState"
  );
}

// Render HelpGuide
if (!code.includes("<HelpGuide onClose={() => setShowHelp(false)} />")) {
  code = code.replace(
    "{showScannerTool && (",
    "{showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}\n      {showScannerTool && ("
  );
}

// Replace the editor view header (line ~820-950) with a much cleaner design
const searchEditorHeader = /<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">([\s\S]*?)<div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">/;

const newEditorHeader = `<div className="flex flex-col gap-6 mb-6">
                
                {/* Top Section: Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
                      Parsed Results
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Found {parsedData.length} employees in the dataset.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => setShowHelp(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 mr-1.5" />
                      Help & Guide
                    </button>
                    <button 
                      onClick={() => setShowEditor(false)} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1.5" />
                      Back to Menu
                    </button>
                    <button
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
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      {isSaving ? "Saving..." : "Save to Cloud"}
                    </button>
                    <button 
                      onClick={async () => {
                        const newRef = doc(collection(db, 'dtr_records'));
                        await setDoc(newRef, { employeeIdOrName: 'New Employee', records: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), userId: 'anonymous' });
                        const newEmp = { id: newRef.id, employeeIdOrName: 'New Employee', records: [] };
                        setParsedData(prev => prev ? [...prev, newEmp] : [newEmp]);
                        setCurrentIndex(parsedData ? parsedData.length : 0);
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add a new user
                    </button>
                  </div>
                </div>

                {/* Batch Generator Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center">
                    <Printer className="w-4 h-4 mr-2 text-gray-500" />
                    Batch Generation Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label htmlFor="period" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</label>
                      <input type="month" id="period" value={period} onChange={(e) => setPeriod(e.target.value)} className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="printRange" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range</label>
                      <select id="printRange" value={printRange} onChange={(e) => setPrintRange(e.target.value as any)} className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="full">Whole Month</option>
                        <option value="1-15">Days 1-15</option>
                        <option value="16-31">Days 16-31</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="userRange" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Users (e.g. 1-15)</label>
                      <input type="text" id="userRange" placeholder="All Users" value={userRange} onChange={(e) => setUserRange(e.target.value)} className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-gray-400" />
                    </div>
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <button onClick={handleDownloadAllDTRs} className="flex-1 inline-flex items-center justify-center px-6 py-2.5 min-h-[46px] bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm">
                        <Download className="h-5 w-5 mr-2" />
                        Generate PDFs
                      </button>
                      <button onClick={async () => { if (confirm("Are you sure you want to clear all DTR records?")) { setParsedData(null); setFile(null); } }} className="inline-flex items-center justify-center px-4 py-2.5 min-h-[46px] bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors border border-red-200">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">`;

code = code.replace(searchEditorHeader, newEditorHeader);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with improved UI!");
