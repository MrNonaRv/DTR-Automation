const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                    <select
                      value={autoFillSchedule}`;

const replace = `                    <select
                      value={autoFillType}
                      onChange={(e) => setAutoFillType(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="straight">Straight Duty (AM In, PM Out)</option>
                      <option value="normal">Normal Duty (4 punches)</option>
                    </select>
                    <select
                      value={autoFillSchedule}`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched autoFillType select into UI");
} else {
  console.log("Could not find insertion point.");
}
