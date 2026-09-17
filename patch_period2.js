const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetFunc = `  const createNewSession = async (newDataArray: any[]) => {`;
const replaceFunc = `  const createNewSession = async (newDataArray: any[], overridePeriod?: string) => {`;
code = code.replace(targetFunc, replaceFunc);

const targetSave = `        period: period || '',`;
const replaceSave = `        period: overridePeriod || period || '',`;
code = code.replace(targetSave, replaceSave);

const targetCall1 = `createNewSession(formattedData);`;
const replaceCall1 = `createNewSession(formattedData, detectedPeriod);`;
code = code.replace(targetCall1, replaceCall1);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched createNewSession period');
