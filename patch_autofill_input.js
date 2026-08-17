const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `                  <div className="flex items-center gap-3">
                    <select
                      value={autoFillUsers}
                      onChange={(e) => setAutoFillUsers(e.target.value)}
                      className="block w-full sm:w-auto pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                    >
                      <option value="">All Users</option>
                      <option value="missing">Users with Missing Days</option>
                      <option value="empty">Users with Completely Empty DTRs</option>
                    </select>
                    <select`;

const replace = `                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="text"
                      placeholder="e.g. 1-5, 8 or 'all'"
                      value={autoFillUsers}
                      onChange={(e) => setAutoFillUsers(e.target.value)}
                      className="block w-full sm:w-64 px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg placeholder:text-gray-400"
                    />
                    <select`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched autoFillUsers to text input");
} else {
  console.log("Could not find search string");
}
