const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

const search = `  const getRecordForDay = (day: number) => {
    return editedRecords.find(r => {`;

const replace = `  const getRecordForDay = (day: number) => {
    let inTargetRange = false;
    if (printRange === 'full') {
       inTargetRange = true;
    } else {
       if (printRange === '1-15' && day <= 15) inTargetRange = true;
       if (printRange === '16-31' && day >= 16) inTargetRange = true;
    }
    if (!inTargetRange) return null;

    return editedRecords.find(r => {`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/components/DTREditor.tsx', code);
  console.log("Patched getRecordForDay!");
} else {
  console.log("Could not find getRecordForDay");
}
