const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `              {parsedData.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex items-center text-blue-900 mb-4 sm:mb-0">
                    <Activity className="w-5 h-5 mr-3 text-blue-600" />
                    <span className="font-semibold text-sm">Automated Duty Auto-Fill</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="text"
                      placeholder="e.g. 1-5, 8 or 'all'"
                      value={autoFillUsers}
                      onChange={(e) => setAutoFillUsers(e.target.value)}
                      className="block w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg placeholder:text-gray-400"
                    />

                    <select
                      value={autoFillRange}
                      onChange={(e) => setAutoFillRange(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="1-15">1st to 15th</option>
                      <option value="16-31">16th to End of Month</option>
                    </select>
                    <select
                      value={autoFillSchedule}
                      onChange={(e) => setAutoFillSchedule(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="none">No Rule - Leave Blank</option>
                      <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (Mon-Thu)</option>
                      <option value="9_day_mon_fri">9 Days (Mon-Fri)</option>
                      <option value="10_day_mon_fri">10 Days (Mon-Fri)</option>
                      <option value="11_day_all">11 Days (Any Day)</option>
                      <option value="12_day_all">12 Days (Any Day)</option>
                      <option value="13_day_all">13 Days (Any Day)</option>
                      <option value="14_day_all">14 Days (Any Day)</option>
                      <option value="15_day_all">15 Days (Mon-Sun)</option>
                    </select>
                    <button
                      onClick={handleAutoFill}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                    >
                      Apply Auto-Fill
                    </button>
                  </div>
                </div>
              )}`;

const replace = `              {parsedData.length > 0 && (
                <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-blue-200 p-5 sm:p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center mb-5">
                    <div className="bg-blue-600 p-2.5 rounded-xl mr-4 shadow-sm">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-blue-950">Magic Auto-Fill Tool</h4>
                      <p className="text-sm text-blue-800 mt-0.5">Quickly generate missing attendance logs for your employees.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Step 1: Who?</label>
                      <input
                        type="text"
                        placeholder="Type 'all' or '1-5'"
                        value={autoFillUsers}
                        onChange={(e) => setAutoFillUsers(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Step 2: Which Half?</label>
                      <select
                        value={autoFillRange}
                        onChange={(e) => setAutoFillRange(e.target.value as any)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 cursor-pointer bg-white"
                      >
                        <option value="1-15">1st to 15th</option>
                        <option value="16-31">16th to End of Month</option>
                      </select>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Step 3: Schedule</label>
                      <select
                        value={autoFillSchedule}
                        onChange={(e) => setAutoFillSchedule(e.target.value as any)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 cursor-pointer bg-white"
                      >
                        <option value="none">No Rule - Leave Blank</option>
                        <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                        <option value="8_day_mon_thu">8 Days (Mon-Thu)</option>
                        <option value="9_day_mon_fri">9 Days (Mon-Fri)</option>
                        <option value="10_day_mon_fri">10 Days (Mon-Fri)</option>
                        <option value="11_day_all">11 Days (Any Day)</option>
                        <option value="12_day_all">12 Days (Any Day)</option>
                        <option value="13_day_all">13 Days (Any Day)</option>
                        <option value="14_day_all">14 Days (Any Day)</option>
                        <option value="15_day_all">15 Days (Mon-Sun)</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAutoFill}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    ✨ Run Magic Auto-Fill
                  </button>
                </div>
              )}`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Auto-Fill UI modernized!");
} else {
  console.log("Could not find old Auto-Fill UI");
}
