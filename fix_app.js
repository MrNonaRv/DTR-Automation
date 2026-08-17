const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I need to find where I broke it. The newEditorHeader replaced down to the navigation bar. 
// I wiped out the Auto-Fill Section. Let's just put it back.

const search = `                {/* Batch Generator Section */}
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

              </div>`;

const replace = search + `

              {parsedData.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex items-center text-blue-900 mb-4 sm:mb-0">
                    <Activity className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-semibold text-sm">Automated Duty Auto-Fill</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={autoFillUsers}
                      onChange={(e) => setAutoFillUsers(e.target.value)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="">All Users</option>
                      <option value="missing">Users with Missing Days</option>
                      <option value="empty">Users with Completely Empty DTRs</option>
                    </select>
                    <select
                      value={autoFillRule}
                      onChange={(e) => setAutoFillRule(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="none">No Rule - Leave Blank</option>
                      <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (1st-15th, Mon-Thu)</option>
                      <option value="10_day_mon_fri">10 Days (1st-15th, Mon-Fri)</option>
                      <option value="15_day_all">15 Days (1st-15th, Mon-Sun)</option>
                    </select>
                    <button
                      onClick={handleAutoFill}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                    >
                      Apply Auto-Fill
                    </button>
                  </div>
                </div>
              )}
            </div>`;

code = code.replace(search, replace);

fs.writeFileSync('src/App.tsx', code);
console.log("Restored auto-fill and div closure");
