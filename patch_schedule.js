const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `              if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if ((autoFillSchedule === '9_day_mon_fri' || autoFillSchedule === '10_day_mon_fri') && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;`;

const replace = `              if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if ((autoFillSchedule === '9_day_mon_fri' || autoFillSchedule === '10_day_mon_fri' || autoFillSchedule === '11_day_all' || autoFillSchedule === '12_day_all' || autoFillSchedule === '13_day_all') && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched schedules!");
} else {
  console.log("Not found.");
}
