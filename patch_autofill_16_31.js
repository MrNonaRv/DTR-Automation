const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state variable
const stateSearch = `const [autoFillSchedule, setAutoFillSchedule] = useState`;
const stateReplace = `const [autoFillRange, setAutoFillRange] = useState<'1-15' | '16-31'>('1-15');
  const [autoFillSchedule, setAutoFillSchedule] = useState`;
code = code.replace(stateSearch, stateReplace);

// 2. Modify loop logic
const logicSearch = `        if (autoFillSchedule !== 'full_month_weekdays' && autoFillSchedule !== 'none' && day > 15) {
          skipDay = true;
        }`;
const logicReplace = `        if (autoFillSchedule !== 'full_month_weekdays' && autoFillSchedule !== 'none') {
          if (autoFillRange === '1-15' && day > 15) skipDay = true;
          if (autoFillRange === '16-31' && day < 16) skipDay = true;
        }`;
code = code.replace(logicSearch, logicReplace);

// 3. Update the UI Dropdown options & insert the new range dropdown
const uiSearch = `                    <select
                      value={autoFillSchedule}
                      onChange={(e) => setAutoFillSchedule(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="none">No Rule - Leave Blank</option>
                      <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (1st-15th, Mon-Thu)</option>
                      <option value="9_day_mon_fri">9 Days (1st-15th, Mon-Fri)</option>
                      <option value="10_day_mon_fri">10 Days (1st-15th, Mon-Fri)</option>
                      <option value="11_day_all">11 Days (1st-15th, Any Day)</option>
                      <option value="12_day_all">12 Days (1st-15th, Any Day)</option>
                      <option value="13_day_all">13 Days (1st-15th, Any Day)</option>
                      <option value="14_day_all">14 Days (1st-15th, Any Day)</option>
                      <option value="15_day_all">15 Days (1st-15th, Mon-Sun)</option>
                    </select>`;

const uiReplace = `                    <select
                      value={autoFillRange}
                      onChange={(e) => setAutoFillRange(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="1-15">1st to 15th</option>
                      <option value="16-31">16th to End of Month</option>
                    </select>
                    <select
                      value={autoFillSchedule}
                      onChange={(e) => setAutoFillSchedule(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="none">No Rule - Leave Blank</option>
                      <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                      <option value="8_day_mon_thu">8 Days (Mon-Thu)</option>
                      <option value="9_day_mon_fri">9 Days (Mon-Fri)</option>
                      <option value="10_day_mon_fri">10 Days (Mon-Fri)</option>
                      <option value="11_day_all">11 Days (Any Day)</option>
                      <option value="12_day_all">12 Days (Any Day)</option>
                      <option value="13_day_all">13 Days (Any Day)</option>
                      <option value="14_day_all">14 Days (Any Day)</option>
                      <option value="15_day_all">15 Days (Mon-Sun)</option>
                    </select>`;
code = code.replace(uiSearch, uiReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Added 16-31 range capability!");
