import React, { useState, useEffect, Suspense } from 'react';
import { UploadCloud, Printer, Save, HelpCircle, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, X, ChevronLeft, CheckCircle2, Trash2, Plus, History, Clock } from 'lucide-react';
import { AttendanceRecord, EmployeeAttendance } from './utils/excelParser';
import { DTREditor } from './components/DTREditor';
import HelpGuide from './components/HelpGuide';
import { Toast } from './components/Toast';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

import { collection, onSnapshot, doc, setDoc, serverTimestamp, writeBatch, deleteDoc, getDoc, getDocs, query, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const ScannerTool = React.lazy(() => import('./components/ScannerTool').then(module => ({ default: module.ScannerTool })));

const toTitleCase = (str: string) => {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => { 
    try { 
      const urlParams = new URLSearchParams(window.location.search);
      const urlSession = urlParams.get('session');
      if (urlSession) {
        localStorage.setItem('dtr_sessionId', urlSession);
        return urlSession;
      }
      return localStorage.getItem('dtr_sessionId'); 
    } catch(e) { return null; } 
  });
  const [currentSessionName, setCurrentSessionName] = useState<string>(() => { try { return localStorage.getItem('dtr_sessionName') || ''; } catch(e) { return ''; } });
    useEffect(() => {
    if (window.location.search.includes('session=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<EmployeeAttendance[] | null>(() => {
    try {
      let saved = null; try { saved = localStorage.getItem('dtr_parsedData'); } catch(e) {}
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load parsedData from localStorage', e);
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [period, setPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }); // YYYY-MM format

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

  const [printRange, setPrintRange] = useState<'full' | '1-15' | '16-31'>('full');
  const [userRange, setUserRange] = useState<string>('');
  const [autoFillUsers, setAutoFillUsers] = useState<string>('');
  const [autoFillType, setAutoFillType] = useState<'straight' | 'normal'>('normal');
  const [autoFillRange, setAutoFillRange] = useState<'1-15' | '16-31'>('1-15');
  const [autoFillSchedule, setAutoFillSchedule] = useState<'full_month_weekdays' | '8_day_mon_thu' | '9_day_mon_fri' | '10_day_mon_fri' | '11_day_all' | '12_day_all' | '13_day_all' | '14_day_all' | '15_day_all' | 'none'>('full_month_weekdays');
  const [autoFillTrigger, setAutoFillTrigger] = useState(0);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScannerTool, setShowScannerTool] = useState(() => { try { return sessionStorage.getItem('dtr_route') === 'scanner'; } catch(e) { return false; } });
  const [showAllSessionsModal, setShowAllSessionsModal] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(() => { try { return sessionStorage.getItem('dtr_route') === 'upload'; } catch(e) { return false; } });
  const [showHelp, setShowHelp] = useState(false);
  const [showEditor, setShowEditor] = useState(() => { try { return sessionStorage.getItem('dtr_route') === 'editor'; } catch(e) { return false; } });
  
  useEffect(() => {
    if (showScannerTool) {
      try { sessionStorage.setItem('dtr_route', 'scanner'); } catch(e) {}
    } else if (showEditor) {
      try { sessionStorage.setItem('dtr_route', 'editor'); } catch(e) {}
    } else if (showUploadUI) {
      try { sessionStorage.setItem('dtr_route', 'upload'); } catch(e) {}
    } else {
      try { sessionStorage.removeItem('dtr_route'); } catch(e) {}
    }
  }, [showScannerTool, showEditor, showUploadUI]);
  useEffect(() => {
    if (showEditor && !parsedData) {
      setShowEditor(false);
    }
  }, [showEditor, parsedData]);

  const [isDragging, setIsDragging] = useState(false);
  const [isCreatingBlank, setIsCreatingBlank] = useState(false);
  const [showBlankPrompt, setShowBlankPrompt] = useState(false);
  const [blankCount, setBlankCount] = useState<number>(1);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  

  useEffect(() => {
    if (currentSessionId) { try { localStorage.setItem('dtr_sessionId', currentSessionId); } catch(e) {} }
  }, [currentSessionId]);

  useEffect(() => {
    if (currentSessionName) { try { localStorage.setItem('dtr_sessionName', currentSessionName); } catch(e) {} }
  }, [currentSessionName]);

  





  const currentSessionIdRef = React.useRef(currentSessionId);
  const currentIndexRef = React.useRef(currentIndex);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);
  
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // MAGIC GLOBAL AUTO-SYNC (Since it's a single user app, we keep all devices on the same page)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'sync'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.activeEmployeeIndex !== undefined && data.activeEmployeeIndex !== currentIndexRef.current) {
          setCurrentIndex(data.activeEmployeeIndex);
        }
        if (data.activeSessionId && data.activeSessionId !== currentSessionIdRef.current) {
          console.log("Auto-syncing to globally active session:", data.activeSessionId);
          setCurrentSessionId(data.activeSessionId);
          
          // Fetch the data for this session so we can load it instantly
          getDoc(doc(db, 'dtr_sessions', data.activeSessionId)).then(sessionSnap => {
            if (sessionSnap.exists()) {
              const sessionData = sessionSnap.data();
              setCurrentSessionName(sessionData.name);
              let serverDataArray: any[] = [];
              if (sessionData.dataMap) {
                Object.keys(sessionData.dataMap).forEach(k => serverDataArray[Number(k)] = sessionData.dataMap[k]);
              } else if (sessionData.data) {
                serverDataArray = sessionData.data;
              }
              setParsedData(serverDataArray);
              if (sessionData.period) setPeriod(sessionData.period);
              setShowEditor(true);
              setToast({ message: "Auto-synced with your other device!", type: "info" });
            }
          });
        }
      }
    });
    return () => unsub();
  }, []);




  // REAL-TIME CLOUD SYNC
  useEffect(() => {
    if (!currentSessionId) return;

    const unsub = onSnapshot(doc(db, 'dtr_sessions', currentSessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert dataMap back to array
        let serverDataArray = [];
        if (data.dataMap) {
          Object.keys(data.dataMap).forEach(k => serverDataArray[Number(k)] = data.dataMap[k]);
        } else if (data.data) {
          serverDataArray = data.data; // Legacy fallback
        }
        
        setParsedData(prevData => {
          if (!prevData) return serverDataArray;
          // Deep compare string to avoid jitter, but now it's much more stable
          const newDataString = JSON.stringify(serverDataArray);
          const prevDataString = JSON.stringify(prevData);
          
          if (newDataString !== prevDataString) {
            console.log("App: Cloud update received! Data differs.");
            return serverDataArray;
          }
          return prevData;
        });

        setPeriod(prev => prev !== data.period ? data.period : prev);
        setCurrentSessionName(prev => prev !== data.name ? data.name : prev);
      }
    });

    return () => unsub();
  }, [currentSessionId]);

  useEffect(() => {
    if (parsedData) {
      try { localStorage.setItem('dtr_parsedData', JSON.stringify(parsedData)); } catch(e) {}
    } else {
      try { localStorage.removeItem('dtr_parsedData'); } catch(e) {}
    }
  }, [parsedData]);
  


    const createNewSession = async (newDataArray: any[], overridePeriod?: string) => {
    const sessionId = Math.random().toString(36).substring(2, 12);
    const sessionName = `DTR Session - ${new Date().toLocaleDateString()}`;
    setCurrentSessionId(sessionId);
    setCurrentSessionName(sessionName);
    setParsedData(newDataArray);
    
    // Map to object
    const dataMap: any = {};
    newDataArray.forEach((emp, i) => dataMap[i] = emp);
    
    setAutoSaveStatus('saving');
    try {
      await setDoc(doc(db, 'dtr_sessions', sessionId), {
        name: sessionName,
        period: overridePeriod || period || '',
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      });
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 500);
      
      // Explicitly update global pointer so other devices follow AFTER doc is created
      setDoc(doc(db, 'settings', 'sync'), { activeSessionId: sessionId }, { merge: true }).catch(console.error);
      loadSavedSessions();
    } catch(e: any) {
      console.error(e);
      setAutoSaveStatus('idle');
      setToast({ message: "Failed to save session to cloud. File may be too large.", type: "error" });
    }
  };

  // Use a real-time listener for the sessions list so it updates instantly across devices
  useEffect(() => {
    const q = query(collection(db, 'dtr_sessions'), orderBy('updatedAt', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snap) => {
      const sessions = snap.docs.map(d => {
        const docData = d.data();
        let dataArray = [];
        if (docData.dataMap) {
          Object.keys(docData.dataMap).forEach(k => dataArray[Number(k)] = docData.dataMap[k]);
        } else if (docData.data) {
          dataArray = docData.data;
        }
        return { id: d.id, ...docData, data: dataArray };
      });
      setSavedSessions(sessions);
    }, (e) => {
      console.error("Failed to load saved sessions", e);
    });
    return () => unsubscribe();
  }, []);

  const loadSavedSessions = () => {}; // Stub out old method if referenced elsewhere

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warn' } | null>(null);

  const checkUpdate = async (manual = false) => {
    try {
      if (manual) setToast({ message: 'Checking for updates...', type: 'info' });
      const res = await fetch('/api/check-update');
      const data = await res.json();
      if (data.updateAvailable) {
        setUpdateAvailable(true);
        if (manual) setToast({ message: 'System update available!', type: 'success' });
      } else {
        if (manual) setToast({ message: 'System is up to date.', type: 'info' });
      }
    } catch (e) {
      console.error("Failed to check for updates");
      if (manual) setToast({ message: 'Failed to check for updates.', type: 'error' });
    }
  };

  useEffect(() => {
    // Check on mount and every hour
    checkUpdate();
    const interval = setInterval(checkUpdate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await fetch('/api/do-update', { method: 'POST' });
      setToast({ message: 'System is updating. Please refresh the page manually in a few moments.', type: 'info' });
      setUpdateAvailable(false);
    } catch (e) {
      setToast({ message: 'Failed to initiate update.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleCreateBlank = async (useNoBiometric: boolean, count: number = 1) => {
    setShowBlankPrompt(false);
    setIsCreatingBlank(true);
    try {
      let newEmployees: any[] = [];
      if (useNoBiometric) {
        try {
          const docSnap = await getDoc(doc(db, 'scanner_configs', 'no_biometric'));
          if (docSnap.exists()) {
            const parsed = docSnap.data();
            if (Array.isArray(parsed.people) && parsed.people.length > 0) {
              newEmployees = parsed.people.map((p: any, idx: number) => { 
                const assignedNo = p.empNo || (176 + idx); 
                return { employeeIdOrName: p.name ? p.name.trim() : `User ${assignedNo}`, empNo: assignedNo, records: [] }; 
              });
            }
          }
        } catch (e) {
          console.error("Failed to load no_biometric config", e);
        }
      }
      
      if (!useNoBiometric && count > 0) {
        newEmployees = Array.from({ length: count }, (_, i) => ({
          employeeIdOrName: '',
          empNo: count > 1 ? i + 1 : undefined,
          records: []
        }));
      } else if (newEmployees.length === 0) {
        newEmployees = [{
          employeeIdOrName: '',
          records: []
        }];
        if (useNoBiometric) {
           setToast({ message: 'No Biometric list is empty. Created a single blank user.', type: 'info' });
        }
      }
      
      const parsedDataArray: any[] = [];
      
      // We now generate the blank users instantly in local memory.
      // This prevents UI freezing and bypasses immediate cloud database write limits.
      newEmployees.forEach(emp => {
        // Generate a random ID mimicking a firestore document ID
        const fakeId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        parsedDataArray.push({ 
          id: fakeId, 
          employeeIdOrName: emp.employeeIdOrName, 
          empNo: emp.empNo, 
          records: [] 
        });
      });
      
      createNewSession(parsedDataArray);
      setCurrentIndex(0);
      setShowEditor(true);
    } catch(err) {
      console.error(err);
    } finally {
      setIsCreatingBlank(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setCurrentIndex(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      e.target.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/upload-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-file-name': encodeURIComponent(file.name)
        },
        body: file,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        let errMsg = 'Expected JSON but got HTML. ';
        if (text.includes('<!DOCTYPE') || text.includes('<!doctype')) {
            errMsg += 'The server returned an HTML page (possibly a redirect or an unhandled proxy error). ';
        }
        errMsg += `Status: ${response.status}. ${text.substring(0, 50)}`;
        throw new Error(errMsg);
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || 'Upload failed');
      }

      const result = await response.json();
      const formattedData = result.data.map((emp: EmployeeAttendance) => ({
        ...emp,
        id: Math.random().toString(36).substring(2, 9),
        employeeIdOrName: toTitleCase(emp.employeeIdOrName)
      }));
      
      
      // Auto-detect period from uploaded data
      let finalPeriod = period;
      if (formattedData && formattedData.length > 0) {
        for (const emp of formattedData) {
          if (emp.records && emp.records.length > 0) {
            const firstDateStr = emp.records[0].date;
            if (firstDateStr) {
              const parts = firstDateStr.split('-');
              if (parts.length >= 2) {
                const year = parts[0];
                const month = parts[1].padStart(2, '0');
                finalPeriod = `${year}-${month}`;
                setPeriod(finalPeriod);
                break; // Found a valid date, break out
              }
            }
          }
        }
      }
      
      createNewSession(formattedData, finalPeriod);
      
      setToast({ message: 'DTR Data uploaded successfully.', type: 'success' });
      setCurrentIndex(0);
      setShowEditor(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
      setToast({ message: err.message || 'An error occurred during upload.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };


  const handleAutoFill = () => {
    if (!parsedData) return;
    
    // Parse target user indices (1-based)
    const targetIndices = new Set<number>();
    if (autoFillUsers.trim().toLowerCase() === 'all') {
      parsedData.forEach((emp, idx) => targetIndices.add(emp.empNo !== undefined ? Number(emp.empNo) : idx + 1));
    } else if (autoFillUsers.trim() === '') {
      const currentEmp = parsedData[currentIndex];
      if (currentEmp) {
        targetIndices.add(currentEmp.empNo !== undefined ? Number(currentEmp.empNo) : currentIndex + 1);
      }
    } else {
      const parts = autoFillUsers.split(',');
      for (const p of parts) {
        const str = p.trim();
        if (!str) continue;
        const match = str.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (match) {
           const start = parseInt(match[1], 10);
           const end = match[2] ? parseInt(match[2], 10) : start;
           for (let i = start; i <= end; i++) targetIndices.add(i);
        } else {
           const num = parseInt(str, 10);
           if (!isNaN(num)) targetIndices.add(num);
        }
      }
    }
    
    if (targetIndices.size === 0) {
      setToast({ message: "Please specify valid users (e.g., 1, 2, 3, 15-20, or 'all').", type: 'error' });
      return;
    }

    let targetYear = -1, targetMonth = -1;
    if (period) {
      const parts = period.split('-');
      if (parts.length === 2) {
        targetYear = parseInt(parts[0], 10);
        targetMonth = parseInt(parts[1], 10);
      }
    }

    const newData = [...parsedData];
    let filledCount = 0;

    for (let i = 0; i < newData.length; i++) {
      const userIdentifier = newData[i].empNo !== undefined ? Number(newData[i].empNo) : i + 1;
      if (!targetIndices.has(userIdentifier)) continue;
      
      const emp = newData[i];
      let newRecords = [...emp.records];
      
      const daysInMonth = (targetYear !== -1 && targetMonth !== -1) ? new Date(targetYear, targetMonth, 0).getDate() : 31;
      let dutyDaysCount = 0;
      
      const targetDatesToKeep = new Set<string>();

      if (autoFillSchedule !== 'none') {
        for (let day = 1; day <= daysInMonth; day++) {
          let skipDay = false;
          if (targetYear !== -1 && targetMonth !== -1) {
            const date = new Date(targetYear, targetMonth - 1, day);
            if (date.getMonth() === targetMonth - 1) {
              const dayOfWeek = date.getDay();
              if (autoFillSchedule === 'full_month_weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if ((autoFillSchedule === '9_day_mon_fri' || autoFillSchedule === '10_day_mon_fri' || autoFillSchedule === '11_day_all') && (dayOfWeek === 0 || dayOfWeek === 6)) skipDay = true;
              if ((autoFillSchedule === '12_day_all' || autoFillSchedule === '13_day_all') && (dayOfWeek === 0)) skipDay = true;
              if (autoFillSchedule === '8_day_mon_thu' && (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6)) skipDay = true;
            } else {
              skipDay = true;
            }
          }
          
          if (autoFillSchedule !== 'full_month_weekdays') {
            if (autoFillRange === '1-15' && day > 15) skipDay = true;
            if (autoFillRange === '16-31' && day < 16) skipDay = true;
          }

          if (skipDay) continue;

          dutyDaysCount++;
          if (autoFillSchedule === '8_day_mon_thu' && dutyDaysCount > 8) break;
          if (autoFillSchedule === '9_day_mon_fri' && dutyDaysCount > 9) break;
          if (autoFillSchedule === '10_day_mon_fri' && dutyDaysCount > 10) break;
          if (autoFillSchedule === '11_day_all' && dutyDaysCount > 11) break;
          if (autoFillSchedule === '12_day_all' && dutyDaysCount > 12) break;
          if (autoFillSchedule === '13_day_all' && dutyDaysCount > 13) break;
          if (autoFillSchedule === '14_day_all' && dutyDaysCount > 14) break;
          if (autoFillSchedule === '15_day_all' && dutyDaysCount > 15) break;

          const dateStr = targetYear !== -1 && targetMonth !== -1 
            ? `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            : `YYYY-MM-${day.toString().padStart(2, '0')}`;
            
          targetDatesToKeep.add(dateStr);
        }

        newRecords = newRecords.filter(r => {
          const dParts = r.date.split('-');
          const d = parseInt(dParts[2], 10);
          
          let inTargetRange = false;
          if (autoFillSchedule === 'full_month_weekdays') {
             inTargetRange = true;
          } else {
             if (autoFillRange === '1-15' && d <= 15) inTargetRange = true;
             if (autoFillRange === '16-31' && d >= 16) inTargetRange = true;
          }

          if (inTargetRange && !targetDatesToKeep.has(r.date)) {
             return false;
          }
          return true;
        });
      }
      
      for (const dateStr of Array.from(targetDatesToKeep)) {
        const existingRecordIndex = newRecords.findIndex(r => r.date === dateStr);
        
        const getRandomTime = (baseHr: number, minOffset: number, maxOffset: number) => {
          const offset = Math.floor(Math.random() * (maxOffset - minOffset + 1)) + minOffset;
          let h = baseHr;
          let m = offset;
          if (m < 0) { h -= 1; m += 60; } else if (m >= 60) { h += 1; m -= 60; }
          const ampm = h >= 12 ? 'PM' : 'AM';
          let h12 = h % 12;
          if (h12 === 0) h12 = 12;
          return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
        };

        const timeIn = getRandomTime(8, -15, -1);
        const amOutTime = getRandomTime(12, 1, 5);
        const pmInTime = getRandomTime(13, -10, -1);
        const pmOutTime = getRandomTime(17, 1, 10);

        if (existingRecordIndex !== -1) {
          const r = { ...newRecords[existingRecordIndex] };
          let changed = false;
          if (!r.amIn) { r.amIn = timeIn; changed = true; }
          if (!r.amOut && amOutTime) { r.amOut = amOutTime; changed = true; }
          if (!r.pmIn && pmInTime) { r.pmIn = pmInTime; changed = true; }
          if (!r.pmOut && pmOutTime) { r.pmOut = pmOutTime; changed = true; }
          if (changed) {
            newRecords[existingRecordIndex] = r;
            filledCount++;
          }
        } else {
          newRecords.push({
            date: dateStr,
            amIn: timeIn,
            amOut: amOutTime,
            pmIn: pmInTime,
            pmOut: pmOutTime
          });
          filledCount++;
        }
      }
      
      newRecords.sort((a, b) => a.date.localeCompare(b.date));
      newData[i] = { ...emp, records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut) };
    }
    
        setParsedData(newData);
    
    // INSTANT CLOUD SYNC FOR AUTO-FILL
    if (currentSessionId) {
      setAutoSaveStatus('saving');
      const dataMap: any = {};
      newData.forEach((emp, i) => dataMap[i] = emp);
      
      updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        dataMap: dataMap,
        updatedAt: serverTimestamp()
      }).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 500);
      }).catch((e: any) => {
        console.error(e);
        setToast({ message: "Failed to sync to cloud. The data might be too large.", type: "error" });
      });
      
      // Force sync pointer for other devices
      setDoc(doc(db, 'settings', 'sync'), { 
        activeSessionId: currentSessionId,
        timestamp: serverTimestamp()
      }, { merge: true }).catch(console.error);
    }
    
    setAutoFillTrigger(prev => prev + 1);
    setToast({ message: `Auto-filled records & cleared extra days.`, type: 'success' });
  };

  const handleDownloadDTR = async (emp: EmployeeAttendance) => {
    try {
      const response = await fetch('/api/generate-dtr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName: emp.employeeIdOrName,
          period: getFormattedPeriod(),
          records: emp.records,
          printRange: printRange,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error('Failed to generate DTR: ' + text.substring(0, 100));
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
         const errJson = await response.json();
         throw new Error(errJson.error || 'Failed to generate DTR');
      }
      if (!contentType || !contentType.includes("application/pdf")) {
         throw new Error('Expected PDF but got: ' + contentType);
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      const formattedPeriod = period ? `_${period.replace(/\s+/g, '_')}` : "";
      link.setAttribute('download', `DTR_${emp.employeeIdOrName.replace(/\s+/g, '_')}${formattedPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setToast({ message: `Error generating PDF: ${err.message}`, type: 'error' });
    }
  };

  const handleDownloadAllDTRs = async () => {
    if (!parsedData) return;
    
    let employeesToProcess = parsedData;
    
    if (userRange.trim()) {
      const targetIndices = new Set<number>();
      const parts = userRange.split(',');
      for (const p of parts) {
        const str = p.trim();
        if (!str) continue;
        const match = str.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (match) {
           const start = parseInt(match[1], 10);
           const end = match[2] ? parseInt(match[2], 10) : start;
           for (let i = start; i <= end; i++) targetIndices.add(i);
        } else {
           const num = parseInt(str, 10);
           if (!isNaN(num)) targetIndices.add(num);
        }
      }
      
      if (targetIndices.size === 0) {
        setToast({ message: "Invalid user format. Use '1, 2, 5-10'.", type: 'error' });
        return;
      }
      
      employeesToProcess = parsedData.filter((emp, idx) => {
        const userIdentifier = emp.empNo !== undefined ? Number(emp.empNo) : idx + 1;
        return targetIndices.has(userIdentifier);
      });
      
      if (employeesToProcess.length === 0) {
         setToast({ message: "No users matched the specified range.", type: 'error' });
         return;
      }
    }

    try {
      const response = await fetch('/api/generate-all-dtrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: getFormattedPeriod(),
          employees: employeesToProcess.map(emp => ({
            employeeName: emp.employeeIdOrName,
            records: emp.records
          })),
          printRange: printRange,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate all DTRs');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
            let downloadFileName = "All_DTR.pdf";
      if (period) {
        try {
          const [year, month] = period.split('-');
          const y = parseInt(year);
          const m = parseInt(month);
          const dateObj = new Date(y, m - 1, 1);
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
          const lastDay = new Date(y, m, 0).getDate();
          
          let dateRangeStr = `1-${lastDay}`;
          if (printRange === '1-15') {
            dateRangeStr = '1-15';
          } else if (printRange === '16-31') {
            dateRangeStr = `16-${lastDay}`;
          }
          
          downloadFileName = `All_DTR_${monthName}_${dateRangeStr}_${y}${userRange.trim() ? `_Users_${userRange.trim()}` : ''}.pdf`;
        } catch(e) {
          downloadFileName = `All_DTR_${period}_${printRange}${userRange.trim() ? `_Users_${userRange.trim()}` : ''}.pdf`;
        }
      } else if (userRange.trim()) {
         downloadFileName = `All_DTR_Users_${userRange.trim()}.pdf`;
      }
      link.setAttribute('download', downloadFileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setToast({ message: `Error generating PDFs: ${err.message}`, type: 'error' });
    }
  };

  const handleUpdateEmployee = React.useCallback(async (idx: number, updatedEmp: EmployeeAttendance) => {
    setParsedData(prev => {
      if (!prev) return null;
      const next = [...prev];
      next[idx] = updatedEmp;
      return next;
    });
    
    // INSTANT CLOUD SYNC FOR THIS SPECIFIC EMPLOYEE ONLY
    if (currentSessionId) {
      // Silently sync to avoid UI disruption
      updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
        [`dataMap.${idx}`]: updatedEmp,
        updatedAt: serverTimestamp()
      }).then(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 500);
      }).catch((e: any) => console.error(e));
      
      // Force sync pointer for other devices
      setDoc(doc(db, 'settings', 'sync'), { 
        activeSessionId: currentSessionId,
        activeEmployeeIndex: idx,
        timestamp: serverTimestamp()
      }, { merge: true }).catch(console.error);
    }
  }, [currentSessionId]);

  const handleDownloadEmployeeDTR = React.useCallback((emp: EmployeeAttendance) => {
    handleDownloadDTR(emp);
  }, [period, printRange]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-blue-100">
      <OfflineIndicator />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-sm text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">DTR Automate</h1>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">By Ralph Anthony O. Olano</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <PWAInstallButton />
            {updateAvailable && (
              <button 
                onClick={handleUpdate} 
                disabled={isUpdating}
                className="flex items-center text-sm font-medium text-white transition-colors bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg border border-blue-600 shadow-sm disabled:opacity-50"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isUpdating ? 'Updating...' : 'Install Update'}
              </button>
            )}

            <button onClick={() => checkUpdate(true)} className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200" title="Check for updates and sync">
              <RefreshCw className="w-4 h-4 mr-2" /> Check Updates
            </button>
            <button onClick={() => setShowScannerTool(true)} className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200">
              <Users className="w-4 h-4 mr-2" /> Scanner Tool
            </button>
            <div className="hidden sm:flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
              Local State
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Update Banner */}
        {updateAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm">
            <div className="flex items-start sm:items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">System Update Available</h3>
                <p className="text-sm text-blue-700 mt-0.5">A new version of the system is available. Would you like to update now?</p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {isUpdating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
              ) : 'Update System'}
            </button>
          </div>
        )}

        {!showEditor && !showUploadUI && (
          <div className="max-w-4xl mx-auto space-y-8 mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Simplify Your DTR Generation</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                Convert raw biometric logs to polished PDF Daily Time Records in seconds. Manage employee rosters, parse attendance, and generate reports.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
                <div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Step 1: Get Scanner Data</h3>
                  <p className="text-gray-500 mb-6 text-base leading-relaxed">First, convert the raw fingerprint scanner file into an Excel workbook.</p>
                </div>
                <button 
                  onClick={() => setShowScannerTool(true)}
                  className="inline-flex items-center justify-center px-5 py-3 border border-teal-200 text-teal-700 bg-teal-50 rounded-xl hover:bg-teal-100 font-medium text-base transition-colors w-full"
                >
                  Open Scanner Tool <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
                <div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <File className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Step 2: Edit & Print DTRs</h3>
                  <p className="text-gray-500 mb-6 text-base leading-relaxed">Upload your Excel workbook here to fix missing times, auto-fill days, and print the PDF forms.</p>
                </div>

                {savedSessions.length > 0 && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Recent Saved DTRs</h4>
                    <div className="space-y-2">
                      {savedSessions.slice(0, 1).map(session => (
                        <button
                          key={session.id}
                          onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                            }
                          }}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                              {session.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                              <span>{session.data?.length || 0} records • {session.period || "No Period"}</span>
                              <span className="text-[10px] text-gray-400">
                                Last updated: {session.updatedAt ? (session.updatedAt.toDate ? session.updatedAt.toDate().toLocaleString() : (session.updatedAt.seconds ? new Date(session.updatedAt.seconds * 1000).toLocaleString() : 'Recently')) : 'Just now'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-1 uppercase tracking-wider">Open DTR</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </button>
                      ))}
                      {savedSessions.length > 1 && (
                        <button
                          onClick={() => setShowAllSessionsModal(true)}
                          className="w-full py-2.5 mt-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          View all {savedSessions.length} saved sessions
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {parsedData && parsedData.length > 0 ? (
                  <div className="mb-5 p-6 bg-green-50 border-2 border-green-400 rounded-2xl shadow-sm">
                    <h4 className="text-xl font-bold text-green-900 mb-2 flex items-center">
                      <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" /> You have active work!
                    </h4>
                    <p className="text-base text-green-800 mb-5">Don't worry, your current progress is safely auto-saved on this computer.</p>
                    <button 
                      onClick={() => setShowEditor(true)}
                      className="inline-flex items-center justify-center px-5 py-4 text-white bg-green-600 rounded-xl hover:bg-green-700 font-bold text-xl transition-all w-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Continue Where I Left Off
                    </button>
                  </div>
                ) : null}

                <button 
                  onClick={() => setShowUploadUI(true)}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-white bg-gray-900 rounded-xl hover:bg-gray-800 font-medium text-base transition-colors w-full"
                >
                  <UploadCloud className="w-5 h-5 mr-2" /> Upload Excel File
                </button>
                <button 
                  disabled={isCreatingBlank}
                  onClick={() => setShowBlankPrompt(true)}
                  className="mt-3 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-medium text-base transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingBlank ? (
                    <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    'Create Blank DTR'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {!showEditor && showUploadUI && (
          <div className="max-w-4xl mx-auto mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex">
              <button 
                onClick={() => setShowUploadUI(false)} 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
            </div>
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Streamline your attendance</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                Upload biometric Excel logs to parse, validate, and generate Daily Time Records in seconds.
              </p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-10 relative overflow-hidden">
              <div 
                className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 relative flex flex-col items-center justify-center text-center ${
                  isDragging ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${
                  isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'
                }`}>
                  <UploadCloud className="w-8 h-8" />
                </div>
                
                <label 
                  htmlFor="file-upload-direct"
                  className="cursor-pointer relative z-10"
                >
                  <span className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Click to upload</span>
                  <span className="text-gray-500 ml-1">or drag and drop your Excel file here</span>
                  <input
                    id="file-upload-direct"
                    type="file"
                    className="sr-only"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                  />
                </label>
                
                <p className="text-gray-400 text-xs mt-3 font-mono">
                  .xlsx or .xls up to 10MB
                </p>
              </div>
            </div>

            {file && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 pl-6 flex flex-col sm:flex-row items-center justify-between animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <File className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</h4>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setFile(null)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isUploading ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : 'Process DTR Data'}
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800 animate-in fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        )}
        
        {showEditor && parsedData && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col gap-6 mb-6">
                
                {/* Top Section: Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
                      Parsed Results
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Found {parsedData.length} employees in the dataset.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => setShowHelp(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 mr-1.5" />
                      Help & Guide
                    </button>
                    <button 
                      onClick={() => setShowEditor(false)} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1.5" />
                      Back to Menu
                    </button>
                    <button 
                      onClick={() => {
                        const newName = prompt("Rename your saved file:", currentSessionName);
                        if (newName) {
                          setCurrentSessionName(newName);
                          if (currentSessionId) {
                            updateDoc(doc(db, 'dtr_sessions', currentSessionId), { name: newName, updatedAt: serverTimestamp() }).catch(console.error);
                          }
                          setToast({ message: "File renamed! Auto-saving...", type: "success" });
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-green-200 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1.5 text-green-600" />
                      {autoSaveStatus === 'saving' ? "Saving to Cloud..." : autoSaveStatus === 'saved' ? `Cloud Saved: ${currentSessionName}` : "Rename File"}
                    </button>

                    <button 
                      onClick={async () => {
                        const newEmp = { employeeIdOrName: '', records: [] };
                        const newIndex = parsedData ? parsedData.length : 0;
                        setParsedData(prev => prev ? [...prev, newEmp] : [newEmp]);
                        setCurrentIndex(newIndex);
                        
                        if (currentSessionId) {
                          updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
                            [`dataMap.${newIndex}`]: newEmp,
                            updatedAt: serverTimestamp()
                          }).catch((e: any) => console.error(e));
                        }
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add a new user
                    </button>
                  </div>
                </div>

                {/* Batch Generator Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center">
                    <Printer className="w-4 h-4 mr-2 text-gray-500" />
                    Batch Generation Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label htmlFor="period" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</label>
                      <input type="month" id="period" value={period} onChange={(e) => {
                        const val = e.target.value;
                        setPeriod(val);
                        if (currentSessionId) {
                          updateDoc(doc(db, 'dtr_sessions', currentSessionId), { period: val, updatedAt: serverTimestamp() }).catch(console.error);
                        }
                      }} className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="printRange" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range</label>
                      <select id="printRange" value={printRange} onChange={(e) => {
                        const val = e.target.value as any;
                        setPrintRange(val);
                        if (val === '1-15' || val === '16-31') {
                          setAutoFillRange(val);
                        }
                      }} className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="full">Whole Month</option>
                        <option value="1-15">Days 1-15</option>
                        <option value="16-31">Days 16-31</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="userRange" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Users (e.g. 1, 3-5)</label>
                      <input type="text" id="userRange" placeholder="All Users" value={userRange} onChange={(e) => setUserRange(e.target.value)} className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-gray-400" />
                    </div>
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <button onClick={handleDownloadAllDTRs} className="flex-1 inline-flex items-center justify-center px-6 py-2.5 min-h-[46px] bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm">
                        <Download className="h-5 w-5 mr-2" />
                        Generate PDFs
                      </button>
                      <button onClick={async () => { if (confirm("Are you sure you want to clear all DTR records?")) { setParsedData(null); setFile(null); setShowEditor(false); setCurrentSessionId(null); } }} className="inline-flex items-center justify-center px-4 py-2.5 min-h-[46px] bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors border border-red-200">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {parsedData.length > 0 && (
                <div className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-blue-200 p-5 sm:p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center mb-5">
                    <div className="bg-blue-600 p-2.5 rounded-xl mr-4 shadow-sm">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-blue-950">Magic Auto-Fill Tool</h4>
                      <p className="text-sm text-blue-800 mt-0.5">Quickly generate missing attendance logs for your employees.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Step 1: Who?</label>
                      <input
                        type="text"
                        placeholder="Blank = Current User. Or type 'all', '1-5'"
                        value={autoFillUsers}
                        onChange={(e) => setAutoFillUsers(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Step 2: Which Half?</label>
                      <select
                        value={autoFillRange}
                        onChange={(e) => setAutoFillRange(e.target.value as any)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 cursor-pointer bg-white"
                      >
                        <option value="1-15">1st to 15th</option>
                        <option value="16-31">16th to End of Month</option>
                      </select>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm transition-all hover:border-blue-300">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Step 3: Schedule</label>
                      <select
                        value={autoFillSchedule}
                        onChange={(e) => setAutoFillSchedule(e.target.value as any)}
                        className="w-full px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 cursor-pointer bg-white"
                      >
                        <option value="none">No Rule - Leave Blank</option>
                        <option value="full_month_mon_fri">Whole Month (Mon-Fri)</option>
                        <option value="8_day_mon_thu">8 Days (Mon-Thu)</option>
                        <option value="9_day_mon_fri">9 Days (Mon-Fri)</option>
                        <option value="10_day_mon_fri">10 Days (Mon-Fri)</option>
                        <option value="11_day_all">11 Days (Mon-Fri)</option>
                        <option value="12_day_all">12 Days (Mon-Sat)</option>
                        <option value="13_day_all">13 Days (Mon-Sat)</option>
                        <option value="14_day_all">14 Days (Any Day)</option>
                        <option value="15_day_all">15 Days (Mon-Sun)</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAutoFill}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    ✨ Run Magic Auto-Fill
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">
              <button
                onClick={() => {
                  setCurrentIndex(prev => {
                    const idx = Math.max(0, prev - 1);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                    return idx;
                  });
                }}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="flex-1 flex justify-center px-4 w-full gap-2 items-center">
                <select
                  value={currentIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setCurrentIndex(idx);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                  }}
                  className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  {parsedData.map((emp, idx) => (
                    <option key={idx} value={idx}>
                      {emp.empNo !== undefined ? emp.empNo : idx + 1}. {emp.employeeIdOrName}
                    </option>
                  ))}
                </select>
                
                {parsedData[currentIndex] && (
                  <button
                    onClick={() => {
                      const emp = parsedData[currentIndex];
                      if (confirm(`Are you sure you want to delete ${emp.employeeIdOrName}?`)) {
                        const isLast = parsedData.length === 1;
                        let nextArray: any[] = [];
                        setParsedData(prev => {
                          if (!prev) return null;
                          const next = prev.filter((_, i) => i !== currentIndex);
                          nextArray = next;
                          return next.length > 0 ? next : null;
                        });
                        
                        // SYNC DELETION (Full array rewrite needed because indices shift)
                        if (currentSessionId && !isLast) {
                           const dataMap: any = {};
                           nextArray.forEach((e, i) => dataMap[i] = e);
                           updateDoc(doc(db, 'dtr_sessions', currentSessionId), {
                             dataMap: dataMap,
                             updatedAt: serverTimestamp()
                           }).catch((e: any) => console.error(e));
                        } else if (currentSessionId && isLast) {
                           deleteDoc(doc(db, 'dtr_sessions', currentSessionId)).catch((e: any) => console.error(e));
                        }
                        
                        if (isLast) {
                          setShowEditor(false);
                        } else {
                          setCurrentIndex(prev => Math.max(0, prev - 1));
                        }
                        setToast({ message: 'User deleted successfully', type: 'success' });
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                    title="Delete User"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setCurrentIndex(prev => {
                    const idx = Math.min(parsedData.length - 1, prev + 1);
                    setDoc(doc(db, 'settings', 'sync'), { activeEmployeeIndex: idx }, { merge: true }).catch(console.error);
                    return idx;
                  });
                }}
                disabled={currentIndex === parsedData.length - 1}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>


            <div className="grid grid-cols-1 gap-6">
              {parsedData.length > 0 && (
                <DTREditor
                  key={`${currentIndex}-${autoFillTrigger}`}
                  index={currentIndex}
                  employee={parsedData[currentIndex]}
                  autoFillTrigger={autoFillTrigger}
                  period={getFormattedPeriod()}
                  printRange={printRange}
                  onUpdate={handleUpdateEmployee}
                  onDownload={handleDownloadEmployeeDTR}
                />
              )}
            </div>
          </div>
        )}
      </main>
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
      {showScannerTool && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"><div className="bg-white p-6 rounded-xl shadow-xl"><RefreshCw className="w-8 h-8 text-blue-600 animate-spin" /></div></div>}>
          <ScannerTool onClose={() => setShowScannerTool(false)} />
        </Suspense>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {showAllSessionsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-500" />
                All Saved Sessions
              </h3>
              <button onClick={() => setShowAllSessionsModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {savedSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Save className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No saved sessions found.</p>
                </div>
              ) : (
                savedSessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => {
                            if (confirm("Load this session? Any unsaved changes in your current view will be lost.")) {
                              setCurrentSessionId(session.id);
                              setCurrentSessionName(session.name);
                              setParsedData(session.data);
                              if (session.period) setPeriod(session.period);
                              setShowEditor(true);
                              setShowAllSessionsModal(false);
                              // Notify other devices
                              setDoc(doc(db, 'settings', 'sync'), { activeSessionId: session.id }, { merge: true }).catch(console.error);
                            }
                    }}
                    className="w-full text-left p-4 hover:bg-blue-50 border border-gray-200 rounded-xl transition-all duration-200 group flex justify-between items-center bg-white shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-1">
                        <Save className="w-4 h-4 text-blue-500" />
                        {session.name}
                      </div>
                      <div className="text-sm text-gray-500 flex flex-col gap-1">
                        <span className="font-medium text-gray-700">{session.data?.length || 0} employees • {session.period || "No Period"}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last updated: {session.updatedAt ? (session.updatedAt.toDate ? session.updatedAt.toDate().toLocaleString() : (session.updatedAt.seconds ? new Date(session.updatedAt.seconds * 1000).toLocaleString() : 'Recently')) : 'Just now'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity mb-2 uppercase tracking-wider bg-blue-100 px-2 py-1 rounded-full">Open Session</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-transform transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
\n      {showBlankPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Blank DTR</h3>
            <p className="text-gray-500 mb-4 text-sm">Choose how many blank users to generate or use your No-Biometric list.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Blank Users</label>
              <input 
                type="number" 
                min="1" 
                max="500" 
                value={blankCount} 
                onChange={(e) => setBlankCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleCreateBlank(false, blankCount)}
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                Create {blankCount} Blank DTR{blankCount !== 1 ? 's' : ''}
              </button>
              
              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                onClick={() => handleCreateBlank(true)}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Use No-Biometric Form
              </button>

              <button 
                onClick={() => setShowBlankPrompt(false)}
                className="w-full inline-flex justify-center items-center px-4 py-2 mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
