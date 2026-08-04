import React, { useState, useEffect, Suspense } from 'react';
import { UploadCloud, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, ChevronLeft, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { AttendanceRecord, EmployeeAttendance } from './utils/excelParser';
import { DTREditor } from './components/DTREditor';
import { Toast } from './components/Toast';
import { collection, onSnapshot, doc, setDoc, serverTimestamp, writeBatch, deleteDoc } from 'firebase/firestore';
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
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<EmployeeAttendance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [period, setPeriod] = useState<string>('July 2026'); // Default or input
  const [printRange, setPrintRange] = useState<'full' | '1-15' | '16-31'>('full');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScannerTool, setShowScannerTool] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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
      
      setParsedData(formattedData);
      
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

  const handleDownloadDTR = async (emp: EmployeeAttendance) => {
    try {
      const response = await fetch('/api/generate-dtr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName: emp.employeeIdOrName,
          period: period,
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
    try {
      const response = await fetch('/api/generate-all-dtrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: period,
          employees: parsedData.map(emp => ({
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
      const formattedPeriod = period ? `_${period.replace(/\s+/g, '_')}` : "";
      link.setAttribute('download', `All_DTRs${formattedPeriod}.pdf`);
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
  }, []);

  const handleDownloadEmployeeDTR = React.useCallback((emp: EmployeeAttendance) => {
    handleDownloadDTR(emp);
  }, [period, printRange]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-blue-100">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Prepare Data</h3>
                  <p className="text-gray-500 mb-6 text-base leading-relaxed">Convert raw .dat files from your biometric scanner into clean Excel workbooks organized by employee name.</p>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Generate DTR</h3>
                  <p className="text-gray-500 mb-6 text-base leading-relaxed">Upload the formatted Excel workbook to review attendance records and generate individual or bulk PDF reports.</p>
                </div>
                
                {parsedData && parsedData.length > 0 ? (
                  <button 
                    onClick={() => setShowEditor(true)}
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium text-base transition-colors w-full shadow-sm mb-3"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" /> View Synced Data ({parsedData.length} records)
                  </button>
                ) : null}

                <button 
                  onClick={() => setShowUploadUI(true)}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-white bg-gray-900 rounded-xl hover:bg-gray-800 font-medium text-base transition-colors w-full"
                >
                  <UploadCloud className="w-5 h-5 mr-2" /> Upload Excel File
                </button>
                <button 
                  onClick={async () => {
                    const newRef = doc(collection(db, 'dtr_records'));
                    await setDoc(newRef, {
                      employeeIdOrName: 'New Employee',
                      records: [],
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      userId: 'anonymous'
                    });
                    
                    const newEmp = {
                      id: newRef.id,
                      employeeIdOrName: 'New Employee',
                      records: []
                    };
                    
                    setParsedData([newEmp]);
                    setCurrentIndex(0);
                    setShowEditor(true);
                  }}
                  className="mt-3 inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 font-medium text-base transition-colors w-full"
                >
                  Create Blank DTR
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Parsed Results
                  </h2>
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <button 
                      onClick={() => {
                        setShowEditor(false);
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1.5" />
                      Back to Menu
                    </button>
                    <button 
                      onClick={async () => {
                        const newRef = doc(collection(db, 'dtr_records'));
                        await setDoc(newRef, {
                          employeeIdOrName: 'New Employee',
                          records: [],
                          createdAt: serverTimestamp(),
                          updatedAt: serverTimestamp(),
                          userId: 'anonymous'
                        });
                        
                        const newEmp = {
                          id: newRef.id,
                          employeeIdOrName: 'New Employee',
                          records: []
                        };
                        
                        setParsedData(prev => {
                          if (prev) {
                            return [...prev, newEmp];
                          }
                          return [newEmp];
                        });
                        
                        if (parsedData) {
                          setCurrentIndex(parsedData.length);
                        } else {
                          setCurrentIndex(0);
                        }
                      }} 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add a new user
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Found {parsedData.length} employees in the dataset.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div className="space-y-2">
                    <label htmlFor="period" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Period</label>
                    <input
                      type="text"
                      id="period"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                      placeholder="e.g. July 2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="printRange" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Print Range</label>
                    <select
                      id="printRange"
                      value={printRange}
                      onChange={(e) => setPrintRange(e.target.value as any)}
                      className="block w-full px-5 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                    >
                      <option value="full">Whole Month</option>
                      <option value="1-15">Days 1-15</option>
                      <option value="16-31">Days 16-31</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDownloadAllDTRs}
                    className="inline-flex items-center justify-center px-8 py-3 min-h-[52px] bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all shadow-md active:scale-[0.98]"
                  >
                    <Download className="h-6 w-6 mr-3" />
                    Generate All DTRs
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to clear all DTR records?")) {
                        setParsedData(null);
                        setFile(null);
                        setShowEditor(false);
                        setToast({ message: 'All records cleared successfully.', type: 'success' });
                      }
                    }}
                    className="inline-flex items-center justify-center px-8 py-3 min-h-[52px] bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all shadow-md active:scale-[0.98] sm:ml-2"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
            
            
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="flex-1 flex justify-center px-4 w-full gap-2 items-center">
                <select
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(Number(e.target.value))}
                  className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  {parsedData.map((emp, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {emp.employeeIdOrName}
                    </option>
                  ))}
                </select>
                
                {parsedData[currentIndex] && (
                  <button
                    onClick={() => {
                      const emp = parsedData[currentIndex];
                      if (confirm(`Are you sure you want to delete ${emp.employeeIdOrName}?`)) {
                        setParsedData(prev => {
                          if (!prev) return null;
                          const next = prev.filter((_, i) => i !== currentIndex);
                          return next.length > 0 ? next : null;
                        });
                        setCurrentIndex(prev => Math.max(0, prev - 1));
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
                onClick={() => setCurrentIndex(prev => Math.min(parsedData.length - 1, prev + 1))}
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
                  key={currentIndex}
                  index={currentIndex}
                  employee={parsedData[currentIndex]}
                  period={period}
                  onUpdate={handleUpdateEmployee}
                  onDownload={handleDownloadEmployeeDTR}
                />
              )}
            </div>
          </div>
        )}
      </main>
      {showScannerTool && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"><div className="bg-white p-6 rounded-xl shadow-xl"><RefreshCw className="w-8 h-8 text-blue-600 animate-spin" /></div></div>}>
          <ScannerTool onClose={() => setShowScannerTool(false)} />
        </Suspense>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
