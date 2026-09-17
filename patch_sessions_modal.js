const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const modalCode = `
      {showAllSessionsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-500" />
                All Saved Sessions
              </h3>
              <button onClick={() => setShowAllSessionsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {savedSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Save className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No saved sessions found.</p>
                </div>
              ) : (
                savedSessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => {
                      loadSession(session);
                      setShowAllSessionsModal(false);
                    }}
                    className="w-full text-left p-4 hover:bg-blue-50 border border-gray-200 rounded-xl transition-all duration-200 group flex justify-between items-center bg-white shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-1">
                        <Save className="w-4 h-4 text-blue-500" />
                        {session.name}
                      </div>
                      <div className="text-sm text-gray-500 flex flex-col gap-1">
                        <span className="font-medium text-gray-700">{session.data?.length || 0} employees • {session.period || "No Period"}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last opened: {session.updatedAt?.toDate ? session.updatedAt.toDate().toLocaleString() : new Date(session.updatedAt).toLocaleString() || 'Recently'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-2 uppercase tracking-wider bg-blue-100 px-2 py-1 rounded-full">Open Session</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace('{showBlankPrompt && (', modalCode + '\\n      {showBlankPrompt && (');
fs.writeFileSync('src/App.tsx', code);
console.log('patched modal');
