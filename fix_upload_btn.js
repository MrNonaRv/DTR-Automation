const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                <button 
                  onClick={() => setShowUploadUI(true)}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-white bg-gray-900 rounded-xl hover:bg-gray-800 font-medium text-base transition-colors w-full"
                >
                  <button 
                  disabled={isCreatingBlank}`;

const replace = `                <button 
                  onClick={() => setShowUploadUI(true)}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-white bg-gray-900 rounded-xl hover:bg-gray-800 font-medium text-base transition-colors w-full"
                >
                  <UploadCloud className="w-5 h-5 mr-2" /> Upload Excel File
                </button>
                <button 
                  disabled={isCreatingBlank}`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed!");
} else {
  console.log("Not found.");
}
