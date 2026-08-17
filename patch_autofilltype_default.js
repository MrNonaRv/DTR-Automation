const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change the default state
code = code.replace(
  "useState<'straight' | 'normal'>('straight');",
  "useState<'straight' | 'normal'>('normal');"
);

// 2. Remove the select UI for autoFillType
const searchSelect = `                    <select
                      value={autoFillType}
                      onChange={(e) => setAutoFillType(e.target.value as any)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="straight">Straight Duty (AM In, PM Out)</option>
                      <option value="normal">Normal Duty (4 punches)</option>
                    </select>`;

if (code.includes(searchSelect)) {
  code = code.replace(searchSelect, "");
  console.log("Removed autoFillType select UI");
} else {
  console.log("Could not find autoFillType select UI");
}

fs.writeFileSync('src/App.tsx', code);
