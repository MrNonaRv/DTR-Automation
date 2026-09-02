const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateSearch = 'const [showBlankPrompt, setShowBlankPrompt] = useState(false);';
const stateReplace = `const [showBlankPrompt, setShowBlankPrompt] = useState(false);
  const [blankCount, setBlankCount] = useState<number>(1);`;

code = code.replace(stateSearch, stateReplace);

const fnSearch = `  const handleCreateBlank = async (useNoBiometric: boolean) => {
    setShowBlankPrompt(false);
    setIsCreatingBlank(true);
    try {
      let newEmployees: any[] = [];
      if (useNoBiometric) {
        try {
          const docSnap = await getDoc(doc(db, 'scanner_configs', 'no_biometric'));
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            if (Array.isArray(parsed.people) && parsed.people.length > 0) {
              newEmployees = parsed.people.map((p: any, idx: number) => { 
                const assignedNo = p.empNo || (176 + idx); 
                return { employeeIdOrName: p.name ? p.name.trim() : \`User \${assignedNo}\`, empNo: assignedNo, records: [] }; 
              });
            }
          }
        } catch (e) {
        }
      }
      
      if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: 'New Employee',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }`;

const fnReplace = `  const handleCreateBlank = async (useNoBiometric: boolean, count: number = 1) => {
    setShowBlankPrompt(false);
    setIsCreatingBlank(true);
    try {
      let newEmployees: any[] = [];
      if (useNoBiometric) {
        try {
          const docSnap = await getDoc(doc(db, 'scanner_configs', 'no_biometric'));
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            if (Array.isArray(parsed.people) && parsed.people.length > 0) {
              newEmployees = parsed.people.map((p: any, idx: number) => { 
                const assignedNo = p.empNo || (176 + idx); 
                return { employeeIdOrName: p.name ? p.name.trim() : \`User \${assignedNo}\`, empNo: assignedNo, records: [] }; 
              });
            }
          }
        } catch (e) {
        }
      }
      
      if (!useNoBiometric && count > 0) {
        newEmployees = Array.from({ length: count }, (_, i) => ({
          employeeIdOrName: count > 1 ? \`User \${i + 1}\` : 'New Employee',
          empNo: count > 1 ? i + 1 : undefined,
          records: []
        }));
      } else if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: 'New Employee',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }`;

code = code.replace(fnSearch, fnReplace);

const uiSearch = `      {showBlankPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Blank DTR</h3>
            <p className="text-gray-500 mb-6 text-sm">Would you like to start with a single empty form, or pre-load the No-Biometric list?</p>
            <div className="space-y-3">
              <button 
                onClick={() => handleCreateBlank(true)}
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                Use No-Biometric Form
              </button>
              <button 
                onClick={() => handleCreateBlank(false)}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Single Blank DTR
              </button>
              <button 
                onClick={() => setShowBlankPrompt(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}`;

const uiReplace = `      {showBlankPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Blank DTR</h3>
            <p className="text-gray-500 mb-4 text-sm">Choose how many blank users to generate or use your No-Biometric list.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Blank Users</label>
              <input 
                type="number" 
                min="1" 
                max="500" 
                value={blankCount} 
                onChange={(e) => setBlankCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleCreateBlank(false, blankCount)}
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                Create {blankCount} Blank DTR{blankCount !== 1 ? 's' : ''}
              </button>
              
              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                onClick={() => handleCreateBlank(true)}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Use No-Biometric Form
              </button>

              <button 
                onClick={() => setShowBlankPrompt(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}`;

code = code.replace(uiSearch, uiReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with bulk create blank!");

