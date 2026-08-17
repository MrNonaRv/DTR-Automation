const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchNav = `<div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="flex-1 flex justify-center px-4 w-full gap-2 items-center">
                <select
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(Number(e.target.value))}
                  className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  {parsedData.map((emp, idx) => (
                    <option key={idx} value={idx}>
                      {emp.empNo !== undefined ? emp.empNo : idx + 1}. {emp.employeeIdOrName}
                    </option>
                  ))}
                </select>
                
                {parsedData[currentIndex] && (
                  <button
                    onClick={() => {
                      const emp = parsedData[currentIndex];
                      if (confirm(\`Are you sure you want to delete \${emp.employeeIdOrName}?\`)) {
                        const isLast = parsedData.length === 1;
                        setParsedData(prev => {
                          if (!prev) return null;
                          const next = prev.filter((_, i) => i !== currentIndex);
                          return next.length > 0 ? next : null;
                        });
                        if (isLast) {
                          setShowEditor(false);
                        } else if (currentIndex === parsedData.length - 1) {
                          setCurrentIndex(prev => prev - 1);
                        }
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Delete this record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentIndex(prev => Math.min((parsedData?.length || 1) - 1, prev + 1))}
                disabled={!parsedData || currentIndex === parsedData.length - 1}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>`;

const replaceNav = `<div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-6 gap-3">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>
              
              <div className="flex-1 flex justify-center w-full gap-2 items-center">
                <div className="relative w-full max-w-sm flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2">
                  <Users className="w-5 h-5 text-gray-400 ml-2" />
                  <select
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="block w-full bg-transparent pl-2 pr-8 py-2.5 text-base font-bold text-gray-800 focus:outline-none appearance-none"
                  >
                    {parsedData.map((emp, idx) => (
                      <option key={idx} value={idx}>
                        {emp.empNo !== undefined ? emp.empNo : idx + 1}. {emp.employeeIdOrName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {parsedData[currentIndex] && (
                  <button
                    onClick={() => {
                      const emp = parsedData[currentIndex];
                      if (confirm(\`Are you sure you want to delete \${emp.employeeIdOrName}?\`)) {
                        const isLast = parsedData.length === 1;
                        setParsedData(prev => {
                          if (!prev) return null;
                          const next = prev.filter((_, i) => i !== currentIndex);
                          return next.length > 0 ? next : null;
                        });
                        if (isLast) {
                          setShowEditor(false);
                        } else if (currentIndex === parsedData.length - 1) {
                          setCurrentIndex(prev => prev - 1);
                        }
                      }
                    }}
                    className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100 flex-shrink-0"
                    title="Delete this record"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentIndex(prev => Math.min((parsedData?.length || 1) - 1, prev + 1))}
                disabled={!parsedData || currentIndex === parsedData.length - 1}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-gray-50 transition-all"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>`;

code = code.replace(searchNav, replaceNav);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched Navigation UI!");
