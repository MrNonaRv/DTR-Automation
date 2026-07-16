const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add ChevronLeft to imports
content = content.replace(
  "import { UploadCloud, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';",
  "import { UploadCloud, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';"
);

// Add currentIndex state
content = content.replace(
  "const [error, setError] = useState<string | null>(null);",
  "const [error, setError] = useState<string | null>(null);\n  const [currentIndex, setCurrentIndex] = useState(0);"
);

// Reset currentIndex on handleReset
content = content.replace(
  "setError(null);\n  };",
  "setError(null);\n    setCurrentIndex(0);\n  };"
);

// Reset currentIndex on upload success
content = content.replace(
  "setParsedData(result.data);\n    } catch (err: any) {",
  "setParsedData(result.data);\n      setCurrentIndex(0);\n    } catch (err: any) {"
);

// Replace mapping with pagination
const gridSectionRegex = /<div className="grid grid-cols-1 gap-6">[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*<\/main>/;

const newGridSection = `<div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              <span className="text-sm font-medium text-gray-700">
                Employee {currentIndex + 1} of {parsedData.length}
              </span>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(parsedData.length - 1, prev + 1))}
                disabled={currentIndex === parsedData.length - 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {parsedData.length > 0 && (
                <DTREditor
                  key={currentIndex}
                  index={currentIndex}
                  employee={parsedData[currentIndex]}
                  period={period}
                  onUpdate={handleUpdateEmployee}
                  onDownload={handleDownloadEmployeeDTR}
                />
              )}
            </div>
          </div>
        )}
      </main>`;

content = content.replace(gridSectionRegex, newGridSection);

fs.writeFileSync('src/App.tsx', content);
