const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const getFormattedPeriod = `
  const getFormattedPeriod = () => {
    if (!period) return '';
    try {
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return period;
    }
  };
`;

code = code.replace(
  `  const [period, setPeriod] = useState<string>('July 2026'); // Default or input`,
  `  const [period, setPeriod] = useState<string>(() => {
    const now = new Date();
    return \`\${now.getFullYear()}-\${(now.getMonth() + 1).toString().padStart(2, '0')}\`;
  }); // YYYY-MM format
${getFormattedPeriod}`
);

code = code.replace(
  `        body: JSON.stringify({
          employeeName: emp.employeeIdOrName,
          period: period,`,
  `        body: JSON.stringify({
          employeeName: emp.employeeIdOrName,
          period: getFormattedPeriod(),`
);

code = code.replace(
  `        body: JSON.stringify({
          period: period,
          employees: parsedData.map`,
  `        body: JSON.stringify({
          period: getFormattedPeriod(),
          employees: parsedData.map`
);

code = code.replace(
  `                    <input
                      type="text"
                      id="period"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                      placeholder="e.g. July 2026"
                    />`,
  `                    <input
                      type="month"
                      id="period"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                    />`
);

// We need to also check if period is used elsewhere, like in DTREditor props.
code = code.replace(
  `                  period={period}`,
  `                  period={getFormattedPeriod()}`
);

fs.writeFileSync('src/App.tsx', code);
