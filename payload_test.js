const records = [];
for(let i=0; i<31; i++) {
  records.push({ date: "2026-09-01", amIn: "08:00", amOut: null, pmIn: null, pmOut: null });
}
const emp = { employeeIdOrName: "John Doe", records };
const arr = Array(200).fill(emp);
console.log("Original size:", JSON.stringify(arr).length);

const arrOpt = arr.map(e => ({
  employeeIdOrName: e.employeeIdOrName,
  records: e.records.map(r => {
    const o = { date: r.date };
    if (r.amIn) o.amIn = r.amIn;
    if (r.amOut) o.amOut = r.amOut;
    if (r.pmIn) o.pmIn = r.pmIn;
    if (r.pmOut) o.pmOut = r.pmOut;
    return o;
  })
}));
console.log("Optimized size:", JSON.stringify(arrOpt).length);
