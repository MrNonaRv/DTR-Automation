const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `onChange={(e) => setPrintRange(e.target.value as any)}`;
const replace = `onChange={(e) => {
                        const val = e.target.value as any;
                        setPrintRange(val);
                        if (val === '1-15' || val === '16-31') {
                          setAutoFillRange(val);
                        }
                      }}`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched printRange onChange!");
} else {
  console.log("Could not find search string.");
}
