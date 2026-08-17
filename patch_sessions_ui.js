const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchUI = `                        <button
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
                        </button>`;

const replaceUI = `                        <button
                          key={session.id}
                          onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
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
                        </button>`;

if (code.includes(searchUI)) {
  code = code.replace(searchUI, replaceUI);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched session UI!");
} else {
  console.log("Could not find session UI to patch");
}
