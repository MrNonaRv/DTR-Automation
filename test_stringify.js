const prevData = [ { name: "John", records: [ { date: "2026-09-01", amIn: "08:00" } ] } ];
const newData = [ { name: "John", records: [ { date: "2026-09-01", amIn: "08:00" } ] } ];
const newDataChanged = [ { name: "John", records: [ { date: "2026-09-01", amIn: "08:01" } ] } ];

console.log(JSON.stringify(prevData) === JSON.stringify(newData)); // true
console.log(JSON.stringify(prevData) === JSON.stringify(newDataChanged)); // false
