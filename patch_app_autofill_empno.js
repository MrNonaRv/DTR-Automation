const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the parsing "all"
code = code.replace(
  /parsedData\.forEach\(\(_, idx\) => targetIndices\.add\(idx \+ 1\)\);/,
  "parsedData.forEach((emp, idx) => targetIndices.add(emp.empNo !== undefined ? Number(emp.empNo) : idx + 1));"
);

// Replace the loop condition
code = code.replace(
  /if \(!targetIndices\.has\(i \+ 1\)\) continue;/,
  "const userIdentifier = newData[i].empNo !== undefined ? Number(newData[i].empNo) : i + 1;\n      if (!targetIndices.has(userIdentifier)) continue;"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx autofill empNo logic");
