const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [autoFillUsers, setAutoFillUsers]')) {
  code = code.replace(
    "const [userRange, setUserRange] = useState<string>('');",
    "const [userRange, setUserRange] = useState<string>('');\n  const [autoFillUsers, setAutoFillUsers] = useState<string>('');\n  const [autoFillType, setAutoFillType] = useState<'straight' | 'normal'>('straight');\n  const [showAutoFill, setShowAutoFill] = useState(false);"
  );
}

const autoFillLogic = `
  const handleAutoFill = () => {
    if (!parsedData) return;
    
    // Parse target user indices (1-based)
    const targetIndices = new Set<number>();
    if (autoFillUsers.trim().toLowerCase() === 'all') {
      parsedData.forEach((_, idx) => targetIndices.add(idx + 1));
    } else {
      const parts = autoFillUsers.split(',');
      for (const p of parts) {
        const str = p.trim();
        if (!str) continue;
        const match = str.match(/^(\\d+)(?:\\s*-\\s*(\\d+))?$/);
        if (match) {
           const start = parseInt(match[1], 10);
           const end = match[2] ? parseInt(match[2], 10) : start;
           for (let i = start; i <= end; i++) targetIndices.add(i);
        } else {
           const num = parseInt(str, 10);
           if (!isNaN(num)) targetIndices.add(num);
        }
      }
    }
    
    if (targetIndices.size === 0) {
      setToast({ message: "Please specify valid users (e.g., 1, 2, 3, 15-20, or 'all').", type: 'error' });
      return;
    }

    // Determine year/month from period
    let targetYear = -1, targetMonth = -1;
    if (period) {
      const parts = period.split('-');
      if (parts.length === 2) {
        targetYear = parseInt(parts[0], 10);
        targetMonth = parseInt(parts[1], 10);
      }
    }

    const newData = [...parsedData];
    let filledCount = 0;

    for (let i = 0; i < newData.length; i++) {
      if (!targetIndices.has(i + 1)) continue;
      
      const emp = newData[i];
      let newRecords = [...emp.records];
      
      const daysInMonth = (targetYear !== -1 && targetMonth !== -1) ? new Date(targetYear, targetMonth, 0).getDate() : 31;
      
      for (let day = 1; day <= daysInMonth; day++) {
        let isWeekend = false;
        if (targetYear !== -1 && targetMonth !== -1) {
          const date = new Date(targetYear, targetMonth - 1, day);
          if (date.getMonth() === targetMonth - 1) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) isWeekend = true;
          } else {
            isWeekend = true;
          }
        }
        if (isWeekend) continue;
        
        const dateStr = targetYear !== -1 && targetMonth !== -1 
          ? \`\${targetYear}-\${targetMonth.toString().padStart(2, '0')}-\${day.toString().padStart(2, '0')}\`
          : \`YYYY-MM-\${day.toString().padStart(2, '0')}\`;
          
        const existingRecordIndex = newRecords.findIndex(r => r.date === dateStr);
        
        const timeIn = '08:00';
        const timeOut = autoFillType === 'straight' ? '17:00' : '12:00';
        const pmIn = autoFillType === 'straight' ? '' : '13:00';
        const pmOut = autoFillType === 'straight' ? '' : '17:00';

        if (existingRecordIndex !== -1) {
          const r = { ...newRecords[existingRecordIndex] };
          let changed = false;
          if (!r.amIn) { r.amIn = timeIn; changed = true; }
          if (!r.amOut && timeOut) { r.amOut = timeOut; changed = true; }
          if (!r.pmIn && pmIn) { r.pmIn = pmIn; changed = true; }
          if (!r.pmOut && pmOut) { r.pmOut = pmOut; changed = true; }
          if (changed) {
            newRecords[existingRecordIndex] = r;
            filledCount++;
          }
        } else {
          newRecords.push({
            date: dateStr,
            amIn: timeIn,
            amOut: timeOut,
            pmIn: pmIn,
            pmOut: pmOut
          });
          filledCount++;
        }
      }
      
      newData[i] = { ...emp, records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut) };
    }
    
    setParsedData(newData);
    setToast({ message: \`Auto-filled \${filledCount} missing records across selected users.\`, type: 'success' });
  };
`;

code = code.replace("  const handleDownloadDTR = async (emp: EmployeeAttendance) => {", autoFillLogic + "\n  const handleDownloadDTR = async (emp: EmployeeAttendance) => {");

const uiToInsertBefore = `<div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">`;
const autoFillUI = `
            {/* Auto-Fill Section */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <button 
                onClick={() => setShowAutoFill(!showAutoFill)}
                className="flex items-center justify-between w-full text-left font-bold text-gray-800"
              >
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Automated Duty Auto-Fill
                </div>
                {showAutoFill ? <ChevronLeft className="w-5 h-5 transform -rotate-90" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              
              {showAutoFill && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Target Users</label>
                    <input
                      type="text"
                      placeholder="e.g. 1, 2, 3, 15-16, or 'all'"
                      value={autoFillUsers}
                      onChange={(e) => setAutoFillUsers(e.target.value)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">List the users (by their No.) to auto-fill missing records for.</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Duty Type</label>
                    <select
                      value={autoFillType}
                      onChange={(e) => setAutoFillType(e.target.value as any)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="straight">Straight Duty (8:00 - 17:00 / 08:00 - 05:00)</option>
                      <option value="normal">Normal Duty (8-12, 1-5)</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAutoFill}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                  >
                    Apply Auto-Fill
                  </button>
                </div>
              )}
            </div>

`;

code = code.replace(uiToInsertBefore, autoFillUI + uiToInsertBefore);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched auto-fill feature!");
