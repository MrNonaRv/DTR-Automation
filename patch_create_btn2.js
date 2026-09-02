const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const search = fs.readFileSync('btn_dump.txt', 'utf8');

const replace = `                <button 
                  disabled={isCreatingBlank}
                  onClick={() => setShowBlankPrompt(true)}
                  className="mt-3 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-medium text-base transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBlank ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create Blank DTR'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

`;

if (code.includes(search.trim())) {
  code = code.replace(search.trim(), replace.trim());
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched successfully!");
} else {
  // Manual string building
  console.log("String mismatch, using regex...");
  code = code.replace(/<button\s+disabled=\{isCreatingBlank\}\s+onClick=\{async \(\) => \{[\s\S]*?\} \/\* end replace \*\//, replace);
}
