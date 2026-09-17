const fs = require('fs');
let code = fs.readFileSync('src/components/DTREditor.tsx', 'utf-8');

const target1 = `                      <input type="text" disabled={!inTargetRange} value={record?.amIn || ''} onChange={(e) => handleRecordChange(day, 'amIn', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'amIn', e.target.value)}`;

const replacement1 = `                      <input type="text" disabled={!inTargetRange} value={record?.amIn || ''} onChange={(e) => handleRecordChange(day, 'amIn', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        onBlur={(e) => handleRecordBlur(day, 'amIn', e.target.value)}`;

const target2 = `                      <input type="text" disabled={!inTargetRange} value={record?.amOut || ''} onChange={(e) => handleRecordChange(day, 'amOut', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'amOut', e.target.value)}`;

const replacement2 = `                      <input type="text" disabled={!inTargetRange} value={record?.amOut || ''} onChange={(e) => handleRecordChange(day, 'amOut', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        onBlur={(e) => handleRecordBlur(day, 'amOut', e.target.value)}`;

const target3 = `                      <input type="text" disabled={!inTargetRange} value={record?.pmIn || ''} onChange={(e) => handleRecordChange(day, 'pmIn', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'pmIn', e.target.value)}`;

const replacement3 = `                      <input type="text" disabled={!inTargetRange} value={record?.pmIn || ''} onChange={(e) => handleRecordChange(day, 'pmIn', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        onBlur={(e) => handleRecordBlur(day, 'pmIn', e.target.value)}`;

const target4 = `                      <input type="text" disabled={!inTargetRange} value={record?.pmOut || ''} onChange={(e) => handleRecordChange(day, 'pmOut', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'pmOut', e.target.value)}`;

const replacement4 = `                      <input type="text" disabled={!inTargetRange} value={record?.pmOut || ''} onChange={(e) => handleRecordChange(day, 'pmOut', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                        onBlur={(e) => handleRecordBlur(day, 'pmOut', e.target.value)}`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
code = code.replace(target3, replacement3);
code = code.replace(target4, replacement4);

fs.writeFileSync('src/components/DTREditor.tsx', code);
console.log('patched enter key');
