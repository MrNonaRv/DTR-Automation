import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertCircle, Download, X, Plus } from 'lucide-react';
import ExcelJS from 'exceljs';
import { Toast, ToastType } from './Toast';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const SCANNER_KEYS = ['scanner1', 'scanner2', 'no_biometric'] as const;
type ScannerKey = typeof SCANNER_KEYS[number];
const DEFAULT_LABELS: Record<ScannerKey, string> = { scanner1: 'Scanner 1', scanner2: 'Scanner 2', no_biometric: 'No Biometric' };
const OUTPUT_FILENAMES: Record<ScannerKey, string> = { scanner1: '1_attlog.xlsx', scanner2: '2_attlog.xlsx', no_biometric: 'no_biometric_attlog.xlsx' };

interface Person {
  id: string;
  empNo?: string;
  name: string;
  dept: string;
}

interface ScannerData {
  label: string;
  people: Person[];
}

export interface RecentFile {
  id: string;
  filename: string;
  uploadedAt: string;
  size: number;
  content: string;
  scannerKey: ScannerKey;
}

import { memo } from 'react';

export const ScannerTool = memo(function ScannerTool({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<ScannerKey | 'convert'>('scanner1');
  const [data, setData] = useState<Record<ScannerKey, ScannerData>>({
    scanner1: { label: 'Scanner 1', people: [] },
    scanner2: { label: 'Scanner 2', people: [] },
    no_biometric: { label: 'No Biometric', people: [] }
  });
  
  const [saveStatus, setSaveStatus] = useState<Record<ScannerKey, 'saved' | 'unsaved' | 'saving'>>({
    scanner1: 'saved',
    scanner2: 'saved',
    no_biometric: 'saved'
  });

  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const saveTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    // Load from firestore
    const loadData = async () => {
      const loaded = { ...data };
      for (const key of SCANNER_KEYS) {
        try {
          const docSnap = await getDoc(doc(db, 'scanner_configs', key));
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            loaded[key] = {
              label: parsed.label || DEFAULT_LABELS[key],
              people: Array.isArray(parsed.people) ? parsed.people : []
            };
          }
        } catch (e) {
          console.error("Failed to load scanner config", e);
        }
      }
      setData(loaded);
      
      try {
        const recentSnap = await getDoc(doc(db, 'scanner_configs', 'recent_files_v1'));
        if (recentSnap.exists()) {
          const parsedRecent = recentSnap.data();
          if (Array.isArray(parsedRecent.files)) {
            setRecentFiles(parsedRecent.files);
          }
        }
      } catch (e) {
        console.error("Failed to load recent files config", e);
      }
    };
    loadData();
  }, []);

  const markUnsaved = (key: ScannerKey) => {
    setSaveStatus(prev => ({ ...prev, [key]: 'unsaved' }));
    if (saveTimerRef.current[key]) clearTimeout(saveTimerRef.current[key]);
    saveTimerRef.current[key] = setTimeout(() => persist(key), 1200);
  };

  const persist = async (key: ScannerKey, customData?: Record<ScannerKey, ScannerData>) => {
    try {
      setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));
      const dataToSave = customData ? customData[key] : dataRef.current[key];
      await setDoc(doc(db, 'scanner_configs', key), dataToSave);
      setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
    } catch (e) {
      console.error('Storage error:', e);
      setToast({ message: 'Failed to sync to cloud', type: 'error' });
      setSaveStatus(prev => ({ ...prev, [key]: 'unsaved' }));
    }
  };

  const updateLabel = (key: ScannerKey, label: string) => {
    setData(prev => ({ ...prev, [key]: { ...prev[key], label } }));
    markUnsaved(key);
  };

  const addPerson = (key: ScannerKey) => {
    setData(prev => {
      const next = { ...prev };
      const people = next[key].people;
      const defaultStart = key === 'no_biometric' ? 176 : 1;
      const nextEmpNo = people.length > 0 ? (Math.max(...people.map(p => parseInt(p.empNo || '0', 10) || 0)) + 1).toString() : defaultStart.toString();
      next[key] = { ...next[key], people: [...people, { id: Math.random().toString(36).slice(2, 10), empNo: nextEmpNo, name: '', dept: '' }] };
      return next;
    });
    markUnsaved(key);
  };

  const updatePerson = (key: ScannerKey, index: number, field: keyof Person, value: string) => {
    setData(prev => {
      const people = [...prev[key].people];
      people[index] = { ...people[index], [field]: value };
      return { ...prev, [key]: { ...prev[key], people } };
    });
    markUnsaved(key);
  };

  const removePerson = (key: ScannerKey, index: number) => {
    setData(prev => {
      const people = [...prev[key].people];
      people.splice(index, 1);
      return { ...prev, [key]: { ...prev[key], people } };
    });
    markUnsaved(key);
  };


  const fileInputRefs: Record<ScannerKey, React.RefObject<HTMLInputElement | null>> = {
    scanner1: useRef<HTMLInputElement>(null),
    scanner2: useRef<HTMLInputElement>(null),
    no_biometric: useRef<HTMLInputElement>(null)
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
            const getCellStr = (cell: any) => {
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
      const fallbackNo = key === 'no_biometric' ? (176 + idx).toString() : (idx + 1).toString();
      ws.addRow([p.empNo || fallbackNo, p.name || '', p.dept || '']);
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
    if (!lower.endsWith('.dat')) {
      setToast({ message: 'Please choose a .dat file', type: 'error' });
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
    const m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5], se = +m[6];
    return new Date(y, mo - 1, d, h, mi, se);
  };

  const parseDatText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const records = [];
    for (const line of lines) {
      // Handle both tab-separated and space-separated formats natively
      const match = line.trim().match(/^(\d+)[\s,]+(\d{4}[-/]\d{1,2}[-/]\d{1,2}[\sT]+\d{1,2}:\d{2}:\d{2})/);
      if (match) {
        const userId = parseInt(match[1], 10);
        const dt = parseDateTimeString(match[2].replace(/[\/]/g, '-').replace('T', ' '));
        if (!isNaN(userId) && dt) records.push({ userId, dt });
        continue;
      }
      // Fallback
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const userId = parseInt(parts[0], 10);
        const dt = parseDateTimeString(parts[1].trim());
        if (!isNaN(userId) && dt) records.push({ userId, dt });
      }
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
         name = `User ${uidNum}`; 
         unmatched++; 
      }

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
        let offsetDate: any = '';
        if (rec.dt && typeof rec.dt.getTime === 'function') {
          offsetDate = new Date(rec.dt.getTime() - rec.dt.getTimezoneOffset() * 60000);
        }
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
    if (!uploadedFile && selectedScanner !== 'no_biometric') return;
    setIsConverting(true);
    setLogs([]);
    setBuiltWorkbookBuffer(null);

    const appendLog = (text: string, type: 'ok' | 'warn' = 'ok') => {
      setLogs(prev => [...prev, { text, type }]);
    };

    try {
      let spec;
      
      if (!uploadedFile && selectedScanner === 'no_biometric') {
        const people = data['no_biometric'].people;
        if (people.length === 0) throw new Error('No Biometric roster is empty.');
        
        // Generate empty records for each person (pre-fill column A with their ID so they can easily type times)
        spec = people.map(p => {
          const userId = parseInt(p.empNo, 10);
          return {
            sheetName: p.name.trim() || `User ${p.empNo}`,
            records: Array(10).fill(null).map(() => ({ userId, dt: '' }))
          };
        });
        appendLog(`Generated blank workbook with ${spec.length} sheets from No Biometric roster.`, 'ok');
      } else {
        const lower = uploadedFile.name.toLowerCase();
      
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
        
        // Save to recent files
        const newFile: RecentFile = {
          id: Math.random().toString(36).slice(2, 10),
          filename: uploadedFile.name,
          uploadedAt: new Date().toISOString(),
          size: uploadedFile.size,
          content: text,
          scannerKey: selectedScanner
        };
        
        setRecentFiles(prev => {
          const next = [newFile, ...prev].slice(0, 10); // Keep last 10
          setDoc(doc(db, 'scanner_configs', 'recent_files_v1'), { files: next.map(f => ({ ...f, content: '' })) }).catch(err => {
            console.error('Failed to save recent files to firestore', err);
          });
          return next;
        });

      } else {
        throw new Error('Unsupported file type.');
      }
      } // close else block

      const buffer = await buildWorkbookFromSpec(spec);
      setBuiltWorkbookBuffer(buffer);
      const filename = OUTPUT_FILENAMES[selectedScanner];
      setBuiltFilename(filename);
      appendLog(`Workbook ready: ${filename}`, 'ok');

    } catch (err: any) {
      appendLog('Error: ' + err.message, 'warn');
      setToast({ message: err.message, type: 'error' });
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
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="No."
                        value={p.empNo || (key === 'no_biometric' ? (176 + idx).toString() : (idx + 1).toString())}
                        onChange={e => updatePerson(key, idx, 'empNo', e.target.value)}
                        className="w-16 bg-transparent border border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-sm font-mono text-gray-500 outline-none transition-colors"
                      />
                    </td>
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
        {activeTab === 'no_biometric' && renderRoster('no_biometric')}

        {activeTab === 'convert' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-wider">1 &mdash; Which scanner is this file from?</label>
              </div>
              <p className="text-sm text-gray-500 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <strong className="text-blue-700">Heads up:</strong> Biometric <code className="font-mono text-xs">.dat</code> files only contain ID numbers. To see real names in your Excel export, ensure you've filled out the roster in the corresponding <strong>Scanner Tab</strong> above before converting!
              </p>
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
                    <p className="font-semibold text-gray-900">Drop a .dat file here, or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">Raw scanner export (.dat)</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".dat"
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
                disabled={(!uploadedFile && selectedScanner !== 'no_biometric') || isConverting}
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
            
            {recentFiles.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Recent Uploads</h3>
                <div className="space-y-3">
                  {recentFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-blue-500" />
                          {file.filename}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 font-mono">
                          {new Date(file.uploadedAt).toLocaleString()} &mdash; {data[file.scannerKey]?.label || file.scannerKey} &mdash; {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      {file.content ? (
                      <button
                        onClick={() => {
                          const blob = new Blob([file.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = file.filename;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setTimeout(() => URL.revokeObjectURL(url), 2000);
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Raw
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                        Available during upload session
                      </span>
                    )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
});
