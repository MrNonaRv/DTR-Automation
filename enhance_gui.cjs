const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldPagination = /<div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">[\s\S]*?<\/div>/;

const newPagination = `
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="flex-1 flex justify-center px-4 w-full">
                <select
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(Number(e.target.value))}
                  className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  {parsedData.map((emp, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {emp.employeeIdOrName}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setCurrentIndex(prev => Math.min(parsedData.length - 1, prev + 1))}
                disabled={currentIndex === parsedData.length - 1}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
`;

content = content.replace(oldPagination, newPagination);

fs.writeFileSync('src/App.tsx', content);
