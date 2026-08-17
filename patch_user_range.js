const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [userRange, setUserRange]')) {
  code = code.replace(
    "const [printRange, setPrintRange] = useState<'full' | '1-15' | '16-31'>('full');",
    "const [printRange, setPrintRange] = useState<'full' | '1-15' | '16-31'>('full');\n  const [userRange, setUserRange] = useState<string>('');"
  );
}

const origHandleDownloadAll = `  const handleDownloadAllDTRs = async () => {
    if (!parsedData) return;
    try {
      const response = await fetch('/api/generate-all-dtrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: getFormattedPeriod(),
          employees: parsedData.map(emp => ({
            employeeName: emp.employeeIdOrName,
            records: emp.records
          })),
          printRange: printRange,
        }),
      });`;

const newHandleDownloadAll = `  const handleDownloadAllDTRs = async () => {
    if (!parsedData) return;
    
    let employeesToProcess = parsedData;
    
    if (userRange.trim()) {
      const match = userRange.trim().match(/^(\\d+)(?:\\s*-\\s*(\\d+))?$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : start;
        
        if (start > 0 && start <= parsedData.length) {
           const actualEnd = Math.min(end, parsedData.length);
           employeesToProcess = parsedData.slice(start - 1, actualEnd);
        } else {
           setToast({ message: "Invalid user range. Start index out of bounds.", type: 'error' });
           return;
        }
      } else {
        setToast({ message: "Invalid user range format. Use '1-15' or '5'.", type: 'error' });
        return;
      }
    }

    try {
      const response = await fetch('/api/generate-all-dtrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: getFormattedPeriod(),
          employees: employeesToProcess.map(emp => ({
            employeeName: emp.employeeIdOrName,
            records: emp.records
          })),
          printRange: printRange,
        }),
      });`;

code = code.replace(origHandleDownloadAll, newHandleDownloadAll);

const origUI = `                  <div className="space-y-2">
                    <label htmlFor="printRange" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Print Range</label>
                    <select
                      id="printRange"
                      value={printRange}
                      onChange={(e) => setPrintRange(e.target.value as any)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                    >
                      <option value="full">Whole Month</option>
                      <option value="1-15">Days 1-15</option>
                      <option value="16-31">Days 16-31</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDownloadAllDTRs}`;

const newUI = `                  <div className="space-y-2">
                    <label htmlFor="printRange" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Date Range</label>
                    <select
                      id="printRange"
                      value={printRange}
                      onChange={(e) => setPrintRange(e.target.value as any)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                    >
                      <option value="full">Whole Month</option>
                      <option value="1-15">Days 1-15</option>
                      <option value="16-31">Days 16-31</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="userRange" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Users (e.g. 1-15)</label>
                    <input
                      type="text"
                      id="userRange"
                      placeholder="All Users"
                      value={userRange}
                      onChange={(e) => setUserRange(e.target.value)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white min-w-[150px] placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    onClick={handleDownloadAllDTRs}`;

code = code.replace(origUI, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched user range feature!");
