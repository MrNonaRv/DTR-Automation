const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

code = code.replace(
  /setDoc\(doc\(db, 'scanner_configs', 'recent_files_v1'\), \{ files: next \}\)/,
  `setDoc(doc(db, 'scanner_configs', 'recent_files_v1'), { files: next.map(f => ({ ...f, content: '' })) })`
);

code = code.replace(
  /<button\s+onClick=\{\(\) => \{\s+const blob = new Blob\(\[file\.content\], \{ type: 'text\/plain' \}\);\s+const url = URL\.createObjectURL\(blob\);\s+const a = document\.createElement\('a'\);\s+a\.href = url;\s+a\.download = file\.filename;\s+document\.body\.appendChild\(a\);\s+a\.click\(\);\s+document\.body\.removeChild\(a\);\s+setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 2000\);\s+\}\}\s+className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center shadow-sm"\s+>\s+<Download className="w-4 h-4 mr-2" \/>\s+Download Raw\s+<\/button>/m,
  `{file.content ? (
                      <button
                        onClick={() => {
                          const blob = new Blob([file.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(url), 2000);
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Raw
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                        Available during upload session
                      </span>
                    )}`
);

fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Done");
