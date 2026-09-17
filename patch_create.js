const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `    // Map to object
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => dataMap[i] = emp);`;

const replace = `    // Map to object (with null-stripping optimization to drastically reduce payload size)
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => {
      const optimizedRecords = emp.records ? emp.records.map((r: any) => {
        const o: any = { date: r.date };
        if (r.amIn) o.amIn = r.amIn;
        if (r.amOut) o.amOut = r.amOut;
        if (r.pmIn) o.pmIn = r.pmIn;
        if (r.pmOut) o.pmOut = r.pmOut;
        return o;
      }) : [];
      dataMap[i] = { ...emp, records: optimizedRecords };
    });`;

code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
