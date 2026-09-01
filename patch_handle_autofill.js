const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const searchRegex = /const handleAutoFill = \(\) => \{[\s\S]*?setToast\(\{ message: `Auto-filled \$\{filledCount\} missing records across selected users\.`, type: 'success' \}\);\n  \};/;

const replacement = `const handleAutoFill = () => {
    if (!parsedData) return;
    
    // Parse target user indices (1-based)
    const targetIndices = new Set<number>();
    if (autoFillUsers.trim().toLowerCase() === 'all') {
      parsedData.forEach((emp, idx) => targetIndices.add(emp.empNo !== undefined ? Number(emp.empNo) : idx + 1));
    } else if (autoFillUsers.trim() === '') {
      const currentEmp = parsedData[currentIndex];
      if (currentEmp) {
        targetIndices.add(currentEmp.empNo !== undefined ? Number(currentEmp.empNo) : currentIndex + 1);
      }
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
      const userIdentifier = newData[i].empNo !== undefined ? Number(newData[i].empNo) : i + 1;
      if (!targetIndices.has(userIdentifier)) continue;
      
      const emp = newData[i];
      let newRecords = [...emp.records];
      
      const daysInMonth = (targetYear !== -1 && targetMonth !== -1) ? new Date(targetYear, targetMonth, 0).getDate() : 31;
      let dutyDaysCount = 0;
      
      const targetDatesToKeep = new Set<string>();

      if (autoFillSchedule !== 'none') {
        for (let day = 1; day <= daysInMonth; day++) {
          let skipDay = false;
          if (targetYear !== -1 && targetMonth !== -1) {
            const date = new Date(targetYear, targetMonth - 1, day);
            if (date.getMonth() === targetMonth - 1) {
              const dayOfWeek = date.getDay();
              if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if ((autoFillSchedule === '9_day_mon_fri' || autoFillSchedule === '10_day_mon_fri') && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;
            } else {
              skipDay = true;
            }
          }
          
          if (autoFillSchedule !== 'full_month_weekdays') {
            if (autoFillRange === '1-15' && day > 15) skipDay = true;
            if (autoFillRange === '16-31' && day < 16) skipDay = true;
          }

          if (skipDay) continue;

          dutyDaysCount++;
          if (autoFillSchedule === '8_day_mon_thu' && dutyDaysCount > 8) break;
          if (autoFillSchedule === '9_day_mon_fri' && dutyDaysCount > 9) break;
          if (autoFillSchedule === '10_day_mon_fri' && dutyDaysCount > 10) break;
          if (autoFillSchedule === '11_day_all' && dutyDaysCount > 11) break;
          if (autoFillSchedule === '12_day_all' && dutyDaysCount > 12) break;
          if (autoFillSchedule === '13_day_all' && dutyDaysCount > 13) break;
          if (autoFillSchedule === '14_day_all' && dutyDaysCount > 14) break;
          if (autoFillSchedule === '15_day_all' && dutyDaysCount > 15) break;

          const dateStr = targetYear !== -1 && targetMonth !== -1 
            ? \`\${targetYear}-\${targetMonth.toString().padStart(2, '0')}-\${day.toString().padStart(2, '0')}\`
            : \`YYYY-MM-\${day.toString().padStart(2, '0')}\`;
            
          targetDatesToKeep.add(dateStr);
        }

        newRecords = newRecords.filter(r => {
          const dParts = r.date.split('-');
          const d = parseInt(dParts[2], 10);
          
          let inTargetRange = false;
          if (autoFillSchedule === 'full_month_weekdays') {
             inTargetRange = true;
          } else {
             if (autoFillRange === '1-15' && d <= 15) inTargetRange = true;
             if (autoFillRange === '16-31' && d >= 16) inTargetRange = true;
          }

          if (inTargetRange && !targetDatesToKeep.has(r.date)) {
             return false;
          }
          return true;
        });
      }
      
      for (const dateStr of Array.from(targetDatesToKeep)) {
        const existingRecordIndex = newRecords.findIndex(r => r.date === dateStr);
        
        const getRandomTime = (baseHr, minOffset, maxOffset) => {
          const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
          let h = baseHr;
          let m = offset;
          if (m < 0) { h -= 1; m += 60; } else if (m >= 60) { h += 1; m -= 60; }
          const ampm = h >= 12 ? 'PM' : 'AM';
          let h12 = h % 12;
          if (h12 === 0) h12 = 12;
          return \`\${h12.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')} \${ampm}\`;
        };

        const timeIn = getRandomTime(8, -15, -1);
        const amOutTime = getRandomTime(12, 1, 5);
        const pmInTime = getRandomTime(13, -10, -1);
        const pmOutTime = getRandomTime(17, 1, 10);

        if (existingRecordIndex !== -1) {
          const r = { ...newRecords[existingRecordIndex] };
          let changed = false;
          if (!r.amIn) { r.amIn = timeIn; changed = true; }
          if (!r.amOut && amOutTime) { r.amOut = amOutTime; changed = true; }
          if (!r.pmIn && pmInTime) { r.pmIn = pmInTime; changed = true; }
          if (!r.pmOut && pmOutTime) { r.pmOut = pmOutTime; changed = true; }
          if (changed) {
            newRecords[existingRecordIndex] = r;
            filledCount++;
          }
        } else {
          newRecords.push({
            date: dateStr,
            amIn: timeIn,
            amOut: amOutTime,
            pmIn: pmInTime,
            pmOut: pmOutTime
          });
          filledCount++;
        }
      }
      
      newRecords.sort((a, b) => a.date.localeCompare(b.date));
      newData[i] = { ...emp, records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut) };
    }
    
    setParsedData(newData);
    setAutoFillTrigger(prev => prev + 1);
    setToast({ message: \`Auto-filled records & cleared extra days.\`, type: 'success' });
  };`;

if (searchRegex.test(code)) {
  code = code.replace(searchRegex, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully patched handleAutoFill to clear extra days!");
} else {
  console.log("Could not find the handleAutoFill block with regex.");
}
