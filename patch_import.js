const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const importLogicToReplace = `      ws.eachRow((row, rowNumber) => {
        const noVal = String(row.getCell(1).value || '').trim();
        // Skip header
        if (rowNumber === 1 && noVal.toLowerCase() === 'no.') return;
        const name = String(row.getCell(2).value || '');
        const dept = String(row.getCell(3).value || '');
        newPeople.push({ id: Math.random().toString(36).slice(2, 10), empNo: noVal || String(rowNumber - 1), name: name.trim(), dept: dept.trim() });
      });`;

const newImportLogic = `      const getCellStr = (cell: any) => {
        if (!cell || cell.value === null || cell.value === undefined) return '';
        if (typeof cell.value === 'object') {
          if ('richText' in cell.value) return cell.value.richText.map((rt: any) => rt.text).join('');
          if ('result' in cell.value) return String(cell.value.result);
        }
        return String(cell.value);
      };

      ws.eachRow((row, rowNumber) => {
        const noVal = getCellStr(row.getCell(1)).trim();
        // Skip header
        if (rowNumber === 1 && noVal.toLowerCase() === 'no.') return;
        const name = getCellStr(row.getCell(2)).trim();
        const dept = getCellStr(row.getCell(3)).trim();
        newPeople.push({ id: Math.random().toString(36).slice(2, 10), empNo: noVal || String(rowNumber - 1), name: name, dept: dept });
      });`;

code = code.replace(importLogicToReplace, newImportLogic);
fs.writeFileSync('src/components/ScannerTool.tsx', code);
console.log("Patched import logic!");
