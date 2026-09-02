const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `<option value="11_day_all">11 Days (Mon-Fri)</option>
                        <option value="12_day_all">12 Days (Mon-Fri)</option>
                        <option value="13_day_all">13 Days (Mon-Fri)</option>`;

const replace = `<option value="11_day_all">11 Days (Mon-Fri)</option>
                        <option value="12_day_all">12 Days (Mon-Sat)</option>
                        <option value="13_day_all">13 Days (Mon-Sat)</option>`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched labels again!");
} else {
  console.log("Not found.");
}
