const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /let daysFilledThisUser = 0;\s*for \(let day = 1; day <= daysInMonth; day\+\+\) \{[\s\S]*?if \(skipDay\) continue;/;

const newLoop = `let dutyDaysCount = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        
        let skipDay = false;
        if (targetYear !== -1 && targetMonth !== -1) {
          const date = new Date(targetYear, targetMonth - 1, day);
          if (date.getMonth() === targetMonth - 1) {
            const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...6=Sat
            
            if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '10_day_mon_fri' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;
            
          } else {
            skipDay = true;
          }
        }
        
        if ((autoFillSchedule === '8_day_mon_thu' || autoFillSchedule === '10_day_mon_fri' || autoFillSchedule === '15_day_all') && day > 15) {
          skipDay = true;
        }

        if (skipDay) continue;

        // If we reach here, this day is a valid duty day for this schedule
        dutyDaysCount++;
        
        // Stop if we hit max days based on schedule
        if (autoFillSchedule === '8_day_mon_thu' && dutyDaysCount > 8) break;
        if (autoFillSchedule === '10_day_mon_fri' && dutyDaysCount > 10) break;
        if (autoFillSchedule === '15_day_all' && dutyDaysCount > 15) break;`;

code = code.replace(regex, newLoop);

const count1 = /filledCount\+\+;\s*daysFilledThisUser\+\+;/g;
code = code.replace(count1, "filledCount++;");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched schedule day counting!");
