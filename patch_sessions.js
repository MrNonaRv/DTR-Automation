const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add state
code = code.replace(
  "const [showScannerTool, setShowScannerTool] = useState(false);",
  "const [showScannerTool, setShowScannerTool] = useState(false);\n  const [showAllSessionsModal, setShowAllSessionsModal] = useState(false);"
);

// 2. Change limit to 15
code = code.replace(
  "limit(5)",
  "limit(15)"
);

// 3. Extract the session card renderer into a function to avoid duplication?
// Or just inline it.
const sessionCard = `
                        <button
                          key={session.id}
                          onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                              setShowAllSessionsModal(false);
                            }
                          }}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {session.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                              <span>{session.data?.length || 0} records • {session.period || "No Period"}</span>
                              <span className="text-[10px] text-gray-400">
                                Last opened: {session.updatedAt?.toDate ? session.updatedAt.toDate().toLocaleString() : new Date(session.updatedAt).toLocaleString() || 'Recently'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 uppercase tracking-wider">Open DTR</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </button>`;

const originalLoop = `{savedSessions.map(session => (
                        <button
                          key={session.id}
                          onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                            }
                          }}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {session.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                              <span>{session.data?.length || 0} records • {session.period || "No Period"}</span>
                              <span className="text-[10px] text-gray-400">
                                Last opened: {session.updatedAt?.toDate ? session.updatedAt.toDate().toLocaleString() : new Date(session.updatedAt).toLocaleString() || 'Recently'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 uppercase tracking-wider">Open DTR</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </button>
                      ))}`;

const newLoop = `{savedSessions.slice(0, 1).map(session => (
                        <button
                          key={session.id}
                          onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                            }
                          }}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {session.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                              <span>{session.data?.length || 0} records • {session.period || "No Period"}</span>
                              <span className="text-[10px] text-gray-400">
                                Last opened: {session.updatedAt?.toDate ? session.updatedAt.toDate().toLocaleString() : new Date(session.updatedAt).toLocaleString() || 'Recently'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 uppercase tracking-wider">Open DTR</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </button>
                      ))}
                      {savedSessions.length > 1 && (
                        <button
                          onClick={() => setShowAllSessionsModal(true)}
                          className="w-full py-2.5 mt-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          View all {savedSessions.length} saved sessions
                        </button>
                      )}`;

code = code.replace(originalLoop, newLoop);

const modalCode = `
      {showAllSessionsModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">All Saved DTRs</h3>
              <button 
                onClick={() => setShowAllSessionsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2">
              {savedSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => {
                    if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                      setCurrentSessionId(session.id);
                      setCurrentSessionName(session.name);
                      setParsedData(session.data);
                      if (session.period) setPeriod(session.period);
                      setShowEditor(true);
                      setShowAllSessionsModal(false);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {session.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                      <span>{session.data?.length || 0} records • {session.period || "No Period"}</span>
                      <span className="text-[10px] text-gray-400">
                        Last opened: {session.updatedAt?.toDate ? session.updatedAt.toDate().toLocaleString() : new Date(session.updatedAt).toLocaleString() || 'Recently'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 uppercase tracking-wider">Open DTR</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
`;

// Insert the modal before the final </div> of the return block of App.
// Since App is the main function, finding the end can be tricky. Let's just put it right before {toast && ...}
code = code.replace(
  "{toast && (",
  modalCode + "\n      {toast && ("
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for modal');
