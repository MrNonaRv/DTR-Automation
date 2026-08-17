const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add autoFillSchedule state
const stateDeclRegex = /const \[autoFillType, setAutoFillType\] = useState\<'straight' \| 'normal'\>\('straight'\);/;
code = code.replace(stateDeclRegex, 
  "const [autoFillType, setAutoFillType] = useState<'straight' | 'normal'>('straight');\\n  const [autoFillSchedule, setAutoFillSchedule] = useState<'full_month_weekdays' | '8_day_mon_thu' | '10_day_mon_fri' | '15_day_all'>('full_month_weekdays');"
);

// 2. Replace the days loop inside handleAutoFill
const innerLoopRegex = /let newRecords = \[\.\.\.emp\.records\];\s*const daysInMonth = \(targetYear !== -1 && targetMonth !== -1\) \? new Date\(targetYear, targetMonth, 0\)\.getDate\(\) : 31;\s*for \(let day = 1; day <= daysInMonth; day\+\+\) \{[\s\S]*?if \(isWeekend\) continue;/;

const newInnerLoop = `let newRecords = [...emp.records];
      
      const daysInMonth = (targetYear !== -1 && targetMonth !== -1) ? new Date(targetYear, targetMonth, 0).getDate() : 31;
      let daysFilledThisUser = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        
        // Stop filling if we hit max days based on schedule
        if (autoFillSchedule === '8_day_mon_thu' && daysFilledThisUser >= 8) break;
        if (autoFillSchedule === '10_day_mon_fri' && daysFilledThisUser >= 10) break;
        if (autoFillSchedule === '15_day_all' && daysFilledThisUser >= 15) break;

        // Skip days past 15 for the half-month specific schedules
        if ((autoFillSchedule === '8_day_mon_thu' || autoFillSchedule === '10_day_mon_fri' || autoFillSchedule === '15_day_all') && day > 15) {
          continue;
        }

        let skipDay = false;
        if (targetYear !== -1 && targetMonth !== -1) {
          const date = new Date(targetYear, targetMonth - 1, day);
          if (date.getMonth() === targetMonth - 1) {
            const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...6=Sat
            
            if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '10_day_mon_fri' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;
            // 15_day_all doesn't skip weekends
            
          } else {
            skipDay = true;
          }
        }
        if (skipDay) continue;`;
        
code = code.replace(innerLoopRegex, newInnerLoop);

// 3. Find where filledCount++ happens and increment daysFilledThisUser too
const replaceFilledCount1 = /newRecords\[existingRecordIndex\] = r;\s*filledCount\+\+;/;
code = code.replace(replaceFilledCount1, "newRecords[existingRecordIndex] = r;\n            filledCount++;\n            daysFilledThisUser++;");

const replaceFilledCount2 = /pmOut: pmOutTime\s*\}\);\s*filledCount\+\+;/;
code = code.replace(replaceFilledCount2, "pmOut: pmOutTime\n          });\n          filledCount++;\n          daysFilledThisUser++;");


// 4. Update the UI to add the new dropdown
const uiRegex = /<label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Duty Type<\/label>[\s\S]*?<\/select>\s*<\/div>\s*<button/;

const newUI = `<label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Duty Type</label>
                    <select
                      value={autoFillType}
                      onChange={(e) => setAutoFillType(e.target.value as any)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="straight">Straight Duty (8:00 - 17:00)</option>
                      <option value="normal">Normal Duty (8-12, 1-5)</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Schedule Pattern</label>
                    <select
                      value={autoFillSchedule}
                      onChange={(e) => setAutoFillSchedule(e.target.value as any)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full_month_weekdays">Full Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (1st-15th, Mon-Thu)</option>
                      <option value="10_day_mon_fri">10 Days (1st-15th, Mon-Fri)</option>
                      <option value="15_day_all">15 Days (1st-15th, Mon-Sun)</option>
                    </select>
                  </div>
                  <button`;
code = code.replace(uiRegex, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched schedule auto-fill!");
