const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const shareButton = `
                    <button 
                      onClick={() => {
                        const shareUrl = \`\${window.location.origin}\${window.location.pathname}?session=\${currentSessionId}\`;
                        navigator.clipboard.writeText(shareUrl);
                        setToast({ message: "Sync Link copied to clipboard! Open this link on your other device.", type: "success" });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-blue-200 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      Copy Sync Link
                    </button>`;

code = code.replace(
  '{autoSaveStatus === \'saving\' ? "Saving to Cloud..." : autoSaveStatus === \'saved\' ? `Cloud Saved: ${currentSessionName}` : "Rename File"}\n                    </button>',
  '{autoSaveStatus === \'saving\' ? "Saving to Cloud..." : autoSaveStatus === \'saved\' ? `Cloud Saved: ${currentSessionName}` : "Rename File"}\n                    </button>' + shareButton
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with share button');
