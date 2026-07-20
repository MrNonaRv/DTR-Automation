const fs = require('fs');

let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

const importLogic = `
  const fileInputRefs = {
    scanner1: useRef<HTMLInputElement>(null),
    scanner2: useRef<HTMLInputElement>(null)
  };

  const handleImportList = (key: ScannerKey) => {
    fileInputRefs[key].current?.click();
  };

  const onImportFileSelected = async (key: ScannerKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.worksheets[0];
      if (!ws) {
        showToast('No worksheet found in the file.');
        return;
      }

      const newPeople: Person[] = [];
      ws.eachRow((row, rowNumber) => {
        const noVal = String(row.getCell(1).value || '').trim();
        // Skip header
        if (rowNumber === 1 && noVal.toLowerCase() === 'no.') return;

        const name = String(row.getCell(2).value || '');
        const dept = String(row.getCell(3).value || '');
        newPeople.push({ id: uid(), name: name.trim(), dept: dept.trim() });
      });

      setData(prev => ({
        ...prev,
        [key]: { ...prev[key], people: newPeople }
      }));
      markUnsaved(key);
      showToast(\`\${data[key].label} list imported\`);
    } catch (err) {
      console.error(err);
      showToast('Failed to import file');
    }
    e.target.value = '';
  };

  const exportList = async (key: ScannerKey) => {`;

content = content.replace('  const exportList = async (key: ScannerKey) => {', importLogic);

const oldButtons = `          <div className="flex items-center space-x-3">
            <button onClick={() => exportList(key)} className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
              Export list (.xlsx)
            </button>
            <button onClick={() => addPerson(key)} className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Add person
            </button>
          </div>`;

const newButtons = `          <div className="flex items-center space-x-3">
            <input 
              type="file" 
              accept=".xlsx" 
              className="hidden" 
              ref={fileInputRefs[key]} 
              onChange={e => onImportFileSelected(key, e)} 
            />
            <button onClick={() => handleImportList(key)} className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
              Import list (.xlsx)
            </button>
            <button onClick={() => exportList(key)} className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
              Export list (.xlsx)
            </button>
            <button onClick={() => addPerson(key)} className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Add person
            </button>
          </div>`;

content = content.replace(oldButtons, newButtons);
fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Modified ScannerTool.tsx successfully');
