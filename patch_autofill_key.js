const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [autoFillTrigger, setAutoFillTrigger]')) {
  code = code.replace(
    "const [autoFillSchedule, setAutoFillSchedule] = useState<'full_month_weekdays' | '8_day_mon_thu' | '10_day_mon_fri' | '15_day_all'>('full_month_weekdays');",
    "const [autoFillSchedule, setAutoFillSchedule] = useState<'full_month_weekdays' | '8_day_mon_thu' | '10_day_mon_fri' | '15_day_all'>('full_month_weekdays');\n  const [autoFillTrigger, setAutoFillTrigger] = useState(0);"
  );
}

// Inside handleAutoFill, update the trigger
const setParsedDataRegex = /setParsedData\(newData\);\s*setToast\(\{ message:/;
code = code.replace(setParsedDataRegex, "setParsedData(newData);\n    setAutoFillTrigger(prev => prev + 1);\n    setToast({ message:");

// Update DTREditor key
const dtrEditorRegex = /<DTREditor\s*key=\{currentIndex\}/;
code = code.replace(dtrEditorRegex, "<DTREditor\n                  key={`${currentIndex}-${autoFillTrigger}`}");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx autoFillTrigger");
