const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update the state definition
const searchState = "useState<'full_month_weekdays' | '8_day_mon_thu' | '10_day_mon_fri' | '15_day_all'>('full_month_weekdays');";
const replaceState = "useState<'full_month_weekdays' | '8_day_mon_thu' | '9_day_mon_fri' | '10_day_mon_fri' | '11_day_all' | '12_day_all' | '13_day_all' | '14_day_all' | '15_day_all'>('full_month_weekdays');";
code = code.replace(searchState, replaceState);

// 2. Update logic for skipping weekends
const searchLogicWeekends = `            if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '10_day_mon_fri' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;`;

const replaceLogicWeekends = `            if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if ((autoFillSchedule === '9_day_mon_fri' || autoFillSchedule === '10_day_mon_fri') && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
            if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;`;
code = code.replace(searchLogicWeekends, replaceLogicWeekends);

// 3. Update logic for skipping days > 15
const searchLogic15 = `        if ((autoFillSchedule === '8_day_mon_thu' || autoFillSchedule === '10_day_mon_fri' || autoFillSchedule === '15_day_all') && day > 15) {`;
const replaceLogic15 = `        if (autoFillSchedule !== 'full_month_weekdays' && autoFillSchedule !== 'none' && day > 15) {`;
code = code.replace(searchLogic15, replaceLogic15);

// 4. Update logic for max days count
const searchLogicMax = `        // Stop if we hit max days based on schedule
        if (autoFillSchedule === '8_day_mon_thu' && dutyDaysCount > 8) break;
        if (autoFillSchedule === '10_day_mon_fri' && dutyDaysCount > 10) break;
        if (autoFillSchedule === '15_day_all' && dutyDaysCount > 15) break;`;
const replaceLogicMax = `        // Stop if we hit max days based on schedule
        if (autoFillSchedule === '8_day_mon_thu' && dutyDaysCount > 8) break;
        if (autoFillSchedule === '9_day_mon_fri' && dutyDaysCount > 9) break;
        if (autoFillSchedule === '10_day_mon_fri' && dutyDaysCount > 10) break;
        if (autoFillSchedule === '11_day_all' && dutyDaysCount > 11) break;
        if (autoFillSchedule === '12_day_all' && dutyDaysCount > 12) break;
        if (autoFillSchedule === '13_day_all' && dutyDaysCount > 13) break;
        if (autoFillSchedule === '14_day_all' && dutyDaysCount > 14) break;
        if (autoFillSchedule === '15_day_all' && dutyDaysCount > 15) break;`;
code = code.replace(searchLogicMax, replaceLogicMax);

// 5. Update UI Dropdown
const searchDropdown = `                      <option value="none">No Rule - Leave Blank</option>
                      <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (1st-15th, Mon-Thu)</option>
                      <option value="10_day_mon_fri">10 Days (1st-15th, Mon-Fri)</option>
                      <option value="15_day_all">15 Days (1st-15th, Mon-Sun)</option>`;
const replaceDropdown = `                      <option value="none">No Rule - Leave Blank</option>
                      <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (1st-15th, Mon-Thu)</option>
                      <option value="9_day_mon_fri">9 Days (1st-15th, Mon-Fri)</option>
                      <option value="10_day_mon_fri">10 Days (1st-15th, Mon-Fri)</option>
                      <option value="11_day_all">11 Days (1st-15th, Any Day)</option>
                      <option value="12_day_all">12 Days (1st-15th, Any Day)</option>
                      <option value="13_day_all">13 Days (1st-15th, Any Day)</option>
                      <option value="14_day_all">14 Days (1st-15th, Any Day)</option>
                      <option value="15_day_all">15 Days (1st-15th, Mon-Sun)</option>`;
code = code.replace(searchDropdown, replaceDropdown);

fs.writeFileSync('src/App.tsx', code);
console.log("Added 9, 11, 12, 13, 14 day schedules!");
