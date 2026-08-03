import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle, Download, X, Plus } from 'lucide-react';
import ExcelJS from 'exceljs';
import { Toast, ToastType } from './Toast';

const SCANNER_KEYS = ['scanner1', 'scanner2'] as const;
type ScannerKey = typeof SCANNER_KEYS[number];
const DEFAULT_LABELS: Record<ScannerKey, string> = { scanner1: 'Scanner 1', scanner2: 'Scanner 2' };
const OUTPUT_FILENAMES: Record<ScannerKey, string> = { scanner1: '1_attlog.xlsx', scanner2: '2_attlog.xlsx' };

interface Person {
  id: string;
  name: string;
  dept: string;
}

interface ScannerData {
  label: string;
  people: Person[];
}

import { memo } from 'react';

export const ScannerTool = memo(function ScannerTool({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<ScannerKey | 'convert'>('scanner1');
  const [data, setData] = useState<Record<ScannerKey, ScannerData>>({
    scanner1: { label: 'Scanner 1', people: [] },
    scanner2: { label: 'Scanner 2', people: [] }
  });
  
  const [saveStatus, setSaveStatus] = useState<Record<ScannerKey, 'saved' | 'unsaved' | 'saving'>>({
    scanner1: 'saved',
    scanner2: 'saved'
  });

  const saveTimerRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    // Load from localStorage
    const loadData = () => {
      const loaded = { ...data };
      for (const key of SCANNER_KEYS) {
        try {
          const val = localStorage.getItem(`attendance-system:${key}`);
          if (val) {
            const parsed = JSON.parse(val);
            loaded[key] = {
              label: parsed.label || DEFAULT_LABELS[key],
              people: Array.isArray(parsed.people) ? parsed.people : []
            };
          }
        } catch (e) {
          // keep default
        }
      }
      setData(loaded);
    };
    loadData();
  }, []);

  const markUnsaved = (key: ScannerKey) => {
    setSaveStatus(prev => ({ ...prev, [key]: 'unsaved' }));
    if (saveTimerRef.current[key]) clearTimeout(saveTimerRef.current[key]);
    saveTimerRef.current[key] = setTimeout(() => persist(key), 900);
  };

  const persist = (key: ScannerKey, customData?: Record<ScannerKey, ScannerData>) => {
    try {
      const dataToSave = customData ? customData[key] : data[key];
      localStorage.setItem(`attendance-system:${key}`, JSON.stringify(dataToSave));
      setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const updateLabel = (key: ScannerKey, label: string) => {
    setData(prev => {
      const next = { ...prev, [key]: { ...prev[key], label } };
      markUnsaved(key);
      return next;
    });
  };

  const addPerson = (key: ScannerKey) => {
    setData(prev => {
      const next = { ...prev, [key]: { ...prev[key], people: [...prev[key].people, { id: Math.random().toString(36).slice(2, 10), name: '', dept: '' }] } };
      markUnsaved(key);
      return next;
    });
  };

  const updatePerson = (key: ScannerKey, index: number, field: keyof Person, value: string) => {
    setData(prev => {
      const people = [...prev[key].people];
      people[index] = { ...people[index], [field]: value };
      const next = { ...prev, [key]: { ...prev[key], people } };
      markUnsaved(key);
      return next;
    });
  };

  const removePerson = (key: ScannerKey, index: number) => {
    setData(prev => {
      const people = [...prev[key].people];
      people.splice(index, 1);
      const next = { ...prev, [key]: { ...prev[key], people } };
      markUnsaved(key);
      return next;
    });
  };


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
        setToast({ message: 'No worksheet found in the file.', type: 'error' });
        return;
      }

      const newPeople: Person[] = [];
      ws.eachRow((row, rowNumber) => {
        const noVal = String(row.getCell(1).value || '').trim();
        // Skip header
        if (rowNumber === 1 && noVal.toLowerCase() === 'no.') return;

        const name = String(row.getCell(2).value || '');
        const dept = String(row.getCell(3).value || '');
        newPeople.push({ id: Math.random().toString(36).slice(2, 10), name: name.trim(), dept: dept.trim() });
      });

      setData(prev => ({
        ...prev,
        [key]: { ...prev[key], people: newPeople }
      }));
      markUnsaved(key);
      setToast({ message: `${data[key].label} list imported from ${file.name}`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to import file', type: 'error' });
    }
    e.target.value = '';
  };

  const exportList = async (key: ScannerKey) => {
    const scanner = data[key];
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Biometric Record');
    ws.columns = [
      { header: 'No.', width: 6 },
      { header: 'Name', width: 30 },
      { header: 'Department/Office', width: 24 }
    ];
    scanner.people.forEach((p, idx) => {
      ws.addRow([idx + 1, p.name || '', p.dept || '']);
    });
    const buffer = await wb.xlsx.writeBuffer();
    const filename = (scanner.label || 'scanner').replace(/[^a-z0-9]+/gi, '_') + '_roster.xlsx';
    downloadBuffer(buffer, filename);
  };

  const downloadBuffer = (buffer: ExcelJS.Buffer, filename: string) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const [selectedScanner, setSelectedScanner] = useState<ScannerKey>('scanner1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<{ text: string, type: 'ok' | 'warn' }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [builtWorkbookBuffer, setBuiltWorkbookBuffer] = useState<ExcelJS.Buffer | null>(null);
  const [builtFilename, setBuiltFilename] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.dat') && !lower.endsWith('.xlsx')) {
      setToast({ message: 'Please choose a .dat or .xlsx file', type: 'error' });
      return;
    }
    setUploadedFile(file);
    setBuiltWorkbookBuffer(null);
    setLogs([]);
    
    if (/^1[_\-]/.test(file.name)) setSelectedScanner('scanner1');
    else if (/^2[_\-]/.test(file.name)) setSelectedScanner('scanner2');
  };

  const cleanSheetName = (name: string) => {
    let n = String(name).replace(/[:\\\/\?\*\[\]]/g, '').trim();
    if (n.length === 0) n = 'Sheet';
    return n.slice(0, 31);
  };

  const parseDateTimeString = (s: string) => {
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
    return new Date(y, mo - 1, d, h, mi, se);
  };

  const parseDatText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      const userId = parseInt(parts[0], 10);
      const dt = parseDateTimeString(parts[1].trim());
      if (!isNaN(userId) && dt) records.push({ userId, dt });
    }
    return records;
  };

  const buildSpecFromDat = (records: any[], people: Person[]) => {
    const byUser = new Map();
    for (const r of records) {
      if (!byUser.has(r.userId)) byUser.set(r.userId, []);
      byUser.get(r.userId).push(r.dt);
    }
    const userIds = Array.from(byUser.keys()).sort((a, b) => a - b);
    let matched = 0, unmatched = 0;
    const spec = userIds.map(uidNum => {
      const times = byUser.get(uidNum).slice().sort((a: Date, b: Date) => a.getTime() - b.getTime());
      const person = people[uidNum - 1];
      let name;
      if (person && person.name && person.name.trim()) { name = person.name.trim(); matched++; }
      else { name = `User ${uidNum}`; unmatched++; }
      return { sheetName: name, records: times.map((dt: Date) => ({ userId: uidNum, dt })) };
    });
    return { spec, matched, unmatched, totalPunches: records.length };
  };

  const parsePerUserWorkbook = async (arrayBuffer: ArrayBuffer) => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(arrayBuffer);
    const spec: any[] = [];
    let totalPunches = 0;
    wb.eachSheet(worksheet => {
      const records: any[] = [];
      worksheet.eachRow(row => {
        const a = row.getCell(1).value;
        const b = row.getCell(2).value;
        if (a == null || b == null) return;
        const userIdNum = typeof a === 'number' ? a : parseInt(a as string, 10);
        let dt: any = b;
        if (dt && typeof dt === 'object' && dt.result !== undefined) dt = dt.result;
        if (!(dt instanceof Date)) {
          if (typeof dt === 'number') {
            // Handle Excel serial date
            dt = new Date(Math.round((dt - 25569) * 86400 * 1000));
          } else if (typeof dt === 'string') { 
            const parsed = new Date(dt); if (!isNaN(parsed.getTime())) dt = parsed; else return; 
          }
          else return;
        }
        if (isNaN(userIdNum) || isNaN(dt.getTime())) return;
        records.push({ userId: userIdNum, dt });
      });
      if (records.length > 0) {
        records.sort((x, y) => x.dt.getTime() - y.dt.getTime());
        spec.push({ sheetName: worksheet.name, records });
        totalPunches += records.length;
      }
    });
    return { spec, totalPunches };
  };

  const buildWorkbookFromSpec = async (spec: any[]) => {
    const wb = new ExcelJS.Workbook();
    const usedNames = new Set();
    for (const item of spec) {
      let base = cleanSheetName(item.sheetName);
      let finalName = base, i = 2;
      while (usedNames.has(finalName)) { finalName = cleanSheetName(`${base} (${i})`); i++; }
      usedNames.add(finalName);

      const ws = wb.addWorksheet(finalName);
      ws.columns = [{ width: 8 }, { width: 22 }];
      item.records.forEach((rec: any) => {
        const offsetDate = new Date(rec.dt.getTime() - rec.dt.getTimezoneOffset() * 60000);
        const row = ws.addRow([rec.userId, offsetDate]);
        const c1 = row.getCell(1), c2 = row.getCell(2);
        c1.font = { name: 'Arial', size: 11 };
        c1.alignment = { horizontal: 'center' };
        c2.font = { name: 'Arial', size: 11 };
        c2.alignment = { horizontal: 'center' };
        c2.numFmt = 'm/d/yyyy h:mm AM/PM';
      });
    }
    return wb.xlsx.writeBuffer();
  };

  const handleConvert = async () => {
    if (!uploadedFile) return;
    setIsConverting(true);
    setLogs([]);
    setBuiltWorkbookBuffer(null);

    const appendLog = (text: string, type: 'ok' | 'warn' = 'ok') => {
      setLogs(prev => [...prev, { text, type }]);
    };

    try {
      const lower = uploadedFile.name.toLowerCase();
      let spec;
      
      if (lower.endsWith('.dat')) {
        const text = await uploadedFile.text();
        const records = parseDatText(text);
        if (records.length === 0) throw new Error('No valid records found in the .dat file.');
        const people = data[selectedScanner].people;
        const result = buildSpecFromDat(records, people);
        spec = result.spec;
        appendLog(`Parsed ${result.totalPunches} punches across ${spec.length} users.`, 'ok');
        appendLog(`Matched ${result.matched} names from ${data[selectedScanner].label} roster.`, result.matched > 0 ? 'ok' : 'warn');
        if (result.unmatched > 0) appendLog(`${result.unmatched} user(s) had no roster match — labeled "User {number}".`, 'warn');
      } else if (lower.endsWith('.xlsx')) {
        const buf = await uploadedFile.arrayBuffer();
        const result = await parsePerUserWorkbook(buf);
        if (result.spec.length === 0) throw new Error('No per-user sheets with UserID/DateTime found in this workbook.');
        spec = result.spec;
        appendLog(`Read ${result.totalPunches} punches across ${spec.length} existing sheets.`, 'ok');
        appendLog('Sheet names kept as-is — no re-matching against the roster.', 'ok');
      } else {
        throw new Error('Unsupported file type.');
      }

      const buffer = await buildWorkbookFromSpec(spec);
      setBuiltWorkbookBuffer(buffer);
      const filename = OUTPUT_FILENAMES[selectedScanner];
      setBuiltFilename(filename);
      appendLog(`Workbook ready: ${filename}`, 'ok');

    } catch (err: any) {
      appendLog('Error: ' + err.message, 'warn');
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  const renderRoster = (key: ScannerKey) => {
    const scanner = data[key];
    return (
      <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-gray-100 gap-4">
          <input
            type="text"
            className="text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors px-1"
            value={scanner.label}
            onChange={e => updateLabel(key, e.target.value)}
          />
          <div className="flex items-center space-x-3">
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
          </div>
        </div>

        {scanner.people.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">This scanner's list is empty</p>
            <p className="text-sm">Add the first person to start the roster.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-mono">
                  <th className="py-3 px-4 w-16">No.</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department / Office</th>
                  <th className="py-3 px-4 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {scanner.people.map((p, idx) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-2 px-4 text-sm font-mono text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={p.name}
                        onChange={e => updatePerson(key, idx, 'name', e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-sm outline-none transition-colors"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="Department / Office"
                        value={p.dept}
                        onChange={e => updatePerson(key, idx, 'dept', e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-sm outline-none transition-colors"
                      />
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button onClick={() => removePerson(key, idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center text-sm rounded-b-xl">
          <div className="flex items-center text-gray-500">
            <div className={`w-2 h-2 rounded-full mr-2 ${saveStatus[key] === 'saved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {saveStatus[key] === 'saved' ? 'All changes saved' : 'Unsaved changes'}
          </div>
          <button onClick={() => { clearTimeout(saveTimerRef.current[key]); persist(key); }} className="text-blue-600 hover:text-blue-700 font-medium">
            Save now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-xs font-mono text-yellow-600 uppercase tracking-widest mb-1.5">Department Biometric Records</div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Attendance System</h1>
            <p className="text-gray-600">Manage scanner rosters and convert attendance exports into named per-user workbooks.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-100 transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex space-x-1">
          {SCANNER_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === key ? 'bg-white text-gray-900 border-t border-l border-r border-gray-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              {data[key].label} <span className="ml-1 text-xs font-mono px-1.5 py-0.5 rounded bg-white/50">{data[key].people.length}</span>
            </button>
          ))}
          <button
            onClick={() => setActiveTab('convert')}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'convert' ? 'bg-white text-gray-900 border-t border-l border-r border-gray-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            Convert File
          </button>
        </div>

        {activeTab === 'scanner1' && renderRoster('scanner1')}
        {activeTab === 'scanner2' && renderRoster('scanner2')}

        {activeTab === 'convert' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            
            <div className="mb-8">
              <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider mb-3">1 &mdash; Which scanner is this file from?</label>
              <div className="flex flex-col sm:flex-row gap-4">
                {SCANNER_KEYS.map(key => (
                  <button
                    key={key}
                    onClick={() => { if (selectedScanner !== key) { setSelectedScanner(key); setUploadedFile(null); setBuiltWorkbookBuffer(null); setLogs([]); } }}
                    className={`flex-1 text-left p-4 rounded-xl border-2 transition-colors ${selectedScanner === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <div className={`font-semibold ${selectedScanner === key ? 'text-blue-900' : 'text-gray-900'}`}>{data[key].label}</div>
                    <div className={`text-xs font-mono mt-1 ${selectedScanner === key ? 'text-blue-700' : 'text-gray-500'}`}>saves as {OUTPUT_FILENAMES[key]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider mb-3">2 &mdash; Upload the file</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${uploadedFile ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
              >
                <UploadCloud className={`w-8 h-8 mx-auto mb-3 ${uploadedFile ? 'text-blue-500' : 'text-gray-400'}`} />
                {uploadedFile ? (
                  <>
                    <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">Drop a .dat or .xlsx file here, or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Raw scanner export (.dat) or a previously-saved per-user workbook (.xlsx)</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".dat,.xlsx"
                  onChange={e => { if (e.target.files?.length) { handleFile(e.target.files[0]); e.target.value = ''; } }}
                />
              </div>
            </div>

            {logs.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 font-mono text-sm space-y-1.5">
                {logs.map((log, i) => (
                  <div key={i} className={log.type === 'ok' ? 'text-green-700' : 'text-amber-600'}>
                    {log.type === 'ok' ? '✓' : '!'} {log.text}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                disabled={!uploadedFile || isConverting}
                onClick={handleConvert}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {isConverting ? 'Converting...' : 'Convert & build workbook'}
              </button>
              
              {builtWorkbookBuffer && (
                <button
                  onClick={() => downloadBuffer(builtWorkbookBuffer, builtFilename)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {builtFilename}
                </button>
              )}
            </div>
            
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
});
