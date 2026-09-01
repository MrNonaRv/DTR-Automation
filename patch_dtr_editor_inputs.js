const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf8');

const search = `              {days.map(day => {
                const record = getRecordForDay(day);
                return (`;

const replace = `              {days.map(day => {
                let inTargetRange = false;
                if (printRange === 'full') {
                   inTargetRange = true;
                } else {
                   if (printRange === '1-15' && day <= 15) inTargetRange = true;
                   if (printRange === '16-31' && day >= 16) inTargetRange = true;
                }
                const record = getRecordForDay(day);
                return (`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  
  // Now add disabled={!inTargetRange} to the inputs
  code = code.replace(/<input\s+type="text"\s+value=\{record\?\.amIn \|\| ''\}\s+onChange=\{/g, '<input type="text" disabled={!inTargetRange} value={record?.amIn || \'\'} onChange={');
  code = code.replace(/<input\s+type="text"\s+value=\{record\?\.amOut \|\| ''\}\s+onChange=\{/g, '<input type="text" disabled={!inTargetRange} value={record?.amOut || \'\'} onChange={');
  code = code.replace(/<input\s+type="text"\s+value=\{record\?\.pmIn \|\| ''\}\s+onChange=\{/g, '<input type="text" disabled={!inTargetRange} value={record?.pmIn || \'\'} onChange={');
  code = code.replace(/<input\s+type="text"\s+value=\{record\?\.pmOut \|\| ''\}\s+onChange=\{/g, '<input type="text" disabled={!inTargetRange} value={record?.pmOut || \'\'} onChange={');
  
  // also add a background color class when disabled
  code = code.replace(/className="w-full h-full text-center py-1 outline-none focus:bg-blue-50 transition-colors"/g, 'className={`w-full h-full text-center py-1 outline-none focus:bg-blue-50 transition-colors ${!inTargetRange ? \'bg-gray-100/50 text-transparent select-none\' : \'\'}`}');

  fs.writeFileSync('src/components/DTREditor.tsx', code);
  console.log("Patched DTREditor inputs!");
} else {
  console.log("Could not find DTREditor input render loop");
}
