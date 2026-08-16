const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const regex = /const buildSpecFromDat = \([\s\S]*?return \{ spec, matched, unmatched, totalPunches: records\.length \};\s*\};/;

const newBuildLogic = `const buildSpecFromDat = (records: any[], people: Person[]) => {
    const byUser = new Map();
    for (const r of records) {
      if (!byUser.has(r.userId)) byUser.set(r.userId, []);
      byUser.get(r.userId).push(r.dt);
    }

    const userIds = Array.from(byUser.keys()).sort((a, b) => a - b);
    let matched = 0, unmatched = 0;

    const spec = userIds.map((uidNum) => {
      const times = byUser.get(uidNum).slice().sort((a: Date, b: Date) => a.getTime() - b.getTime());
      
      const person = people.find((p, idx) => {
        const empNoStr = String(p.empNo || '').trim();
        const pIdNum = parseInt(empNoStr, 10);
        if (!isNaN(pIdNum) && pIdNum === uidNum) return true;
        if (empNoStr === String(uidNum)) return true;
        
        // If the ID was missing or corrupted, check if its auto-numbered index matches
        // e.g. if the user didn't have numbers in their Excel sheet, the UI defaults to idx + 1
        // Scanner 2 doesn't have an auto-number offset like 'no_biometric' (176), so it defaults to idx + 1
        const fallbackNum = selectedScanner === 'no_biometric' ? (176 + idx) : (idx + 1);
        if (fallbackNum === uidNum) return true;
        
        return false;
      });
      
      let name;
      if (person && person.name && String(person.name).trim() && String(person.name).trim() !== '[object Object]') { 
         name = String(person.name).trim(); 
         matched++; 
      }
      else { 
         name = \`User \${uidNum}\`; 
         unmatched++; 
      }

      return { sheetName: name, records: times.map((dt: Date) => ({ userId: uidNum, dt })) };
    });

    return { spec, matched, unmatched, totalPunches: records.length };
  };`;

code = code.replace(regex, newBuildLogic);
fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched build logic using regex!");
