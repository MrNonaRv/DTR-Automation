const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('<button') && lines[lines.indexOf(l)+1]?.includes('disabled={isCreatingBlank}') && lines[lines.indexOf(l)+2]?.includes('onClick={async () => {'));
if (startIdx !== -1) {
  let endIdx = startIdx;
  while(endIdx < lines.length && !lines[endIdx].includes("'Create Blank DTR'")) {
    endIdx++;
  }
  endIdx += 2; // skip ) : and </button>

  const newBtn = `                <button 
                  disabled={isCreatingBlank}
                  onClick={() => setShowBlankPrompt(true)}
                  className="mt-3 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-medium text-base transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBlank ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create Blank DTR'
                  )}
                </button>`;
  
  lines.splice(startIdx, endIdx - startIdx + 1, newBtn);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log("Fixed button!");
} else {
  console.log("Not found.");
}
