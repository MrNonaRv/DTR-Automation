const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const origAutoFillInner = `        const timeIn = '08:00';
        const timeOut = autoFillType === 'straight' ? '17:00' : '12:00';
        const pmIn = autoFillType === 'straight' ? '' : '13:00';
        const pmOut = autoFillType === 'straight' ? '' : '17:00';

        if (existingRecordIndex !== -1) {
          const r = { ...newRecords[existingRecordIndex] };
          let changed = false;
          if (!r.amIn) { r.amIn = timeIn; changed = true; }
          if (!r.amOut && timeOut) { r.amOut = timeOut; changed = true; }
          if (!r.pmIn && pmIn) { r.pmIn = pmIn; changed = true; }
          if (!r.pmOut && pmOut) { r.pmOut = pmOut; changed = true; }`;

const newAutoFillInner = `        const getRandomTime = (baseHr: number, minOffset: number, maxOffset: number) => {
          const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
          let h = baseHr;
          let m = offset;
          if (m < 0) {
            h -= 1;
            m += 60;
          } else if (m >= 60) {
            h += 1;
            m -= 60;
          }
          const ampm = h >= 12 ? 'PM' : 'AM';
          let h12 = h % 12;
          if (h12 === 0) h12 = 12;
          return \`\${h12.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')} \${ampm}\`;
        };

        const timeIn = getRandomTime(8, -15, -1); // 07:45 AM - 07:59 AM
        const amOutTime = autoFillType === 'straight' ? '' : getRandomTime(12, 1, 5); // 12:01 PM - 12:05 PM
        const pmInTime = autoFillType === 'straight' ? '' : getRandomTime(13, -10, -1); // 12:50 PM - 12:59 PM
        const pmOutTime = getRandomTime(17, 1, 10); // 05:01 PM - 05:10 PM

        if (existingRecordIndex !== -1) {
          const r = { ...newRecords[existingRecordIndex] };
          let changed = false;
          if (!r.amIn) { r.amIn = timeIn; changed = true; }
          if (!r.amOut && amOutTime) { r.amOut = amOutTime; changed = true; }
          if (!r.pmIn && pmInTime) { r.pmIn = pmInTime; changed = true; }
          if (!r.pmOut && pmOutTime) { r.pmOut = pmOutTime; changed = true; }`;

const origAutoFillCreate = `        } else {
          newRecords.push({
            date: dateStr,
            amIn: timeIn,
            amOut: timeOut,
            pmIn: pmIn,
            pmOut: pmOut
          });
          filledCount++;
        }`;

const newAutoFillCreate = `        } else {
          newRecords.push({
            date: dateStr,
            amIn: timeIn,
            amOut: amOutTime,
            pmIn: pmInTime,
            pmOut: pmOutTime
          });
          filledCount++;
        }`;


code = code.replace(origAutoFillInner, newAutoFillInner);
code = code.replace(origAutoFillCreate, newAutoFillCreate);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched randomness and 12-hour format!");
