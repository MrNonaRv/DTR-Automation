const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// --- Patch 1: Make the "Resume" button big, friendly, and obvious ---
const searchResume = `{parsedData && parsedData.length > 0 ? (
                  <button 
                    onClick={() => setShowEditor(true)}
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium text-base transition-colors w-full shadow-sm mb-3"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> View Synced Data ({parsedData.length} records)
                  </button>
                ) : null}`;

const replaceResume = `{parsedData && parsedData.length > 0 ? (
                  <div className="mb-5 p-6 bg-green-50 border-2 border-green-400 rounded-2xl shadow-sm">
                    <h4 className="text-xl font-bold text-green-900 mb-2 flex items-center">
                      <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" /> You have active work!
                    </h4>
                    <p className="text-base text-green-800 mb-5">Don't worry, your current progress is safely auto-saved on this computer.</p>
                    <button 
                      onClick={() => setShowEditor(true)}
                      className="inline-flex items-center justify-center px-5 py-4 text-white bg-green-600 rounded-xl hover:bg-green-700 font-bold text-xl transition-all w-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Continue Where I Left Off
                    </button>
                  </div>
                ) : null}`;

code = code.replace(searchResume, replaceResume);


// --- Patch 2: Make saving to the cloud easier by auto-filling the name ---
const searchSave = `const sessionName = prompt("Enter a name for this session (e.g. 'Aug 2026')");
                        if (!sessionName) return;`;

const replaceSave = `const defaultName = period ? \`DTR: \${period}\` : \`My Saved DTR (\${new Date().toLocaleDateString()})\`;
                        const sessionName = prompt("Save your work online so you don't lose it!\\n\\nName this file:", defaultName);
                        if (!sessionName) return;`;

code = code.replace(searchSave, replaceSave);


// --- Patch 3: Make the labels friendlier ---
code = code.replace('<h3 className="text-2xl font-bold text-gray-900 mb-3">1. Prepare Data</h3>', '<h3 className="text-2xl font-bold text-gray-900 mb-3">Step 1: Get Scanner Data</h3>');
code = code.replace('<p className="text-gray-500 mb-6 text-base leading-relaxed">Convert raw .dat files from your biometric scanner into clean Excel workbooks organized by employee name.</p>', '<p className="text-gray-500 mb-6 text-base leading-relaxed">First, convert the raw fingerprint scanner file into an Excel workbook.</p>');

code = code.replace('<h3 className="text-2xl font-bold text-gray-900 mb-3">2. Generate DTR</h3>', '<h3 className="text-2xl font-bold text-gray-900 mb-3">Step 2: Edit & Print DTRs</h3>');
code = code.replace('<p className="text-gray-500 mb-6 text-base leading-relaxed">Upload the formatted Excel workbook to review attendance records and generate individual or bulk PDF reports.</p>', '<p className="text-gray-500 mb-6 text-base leading-relaxed">Upload your Excel workbook here to fix missing times, auto-fill days, and print the PDF forms.</p>');


fs.writeFileSync('src/App.tsx', code);
console.log("Applied Grandma-friendly patches!");
