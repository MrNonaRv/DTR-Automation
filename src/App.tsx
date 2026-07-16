import React, { useState, useEffect } from 'react';
import { UploadCloud, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord, EmployeeAttendance } from './utils/excelParser';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<EmployeeAttendance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('July 2026'); // Default or input
  const [printRange, setPrintRange] = useState<'full' | '1-15' | '16-31'>('full');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const res = await fetch('/api/check-update');
        const data = await res.json();
        if (data.updateAvailable) {
          setUpdateAvailable(true);
        }
      } catch (e) {
        console.error("Failed to check for updates");
      }
    };
    
    // Check on mount and every hour
    checkUpdate();
    const interval = setInterval(checkUpdate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await fetch('/api/do-update', { method: 'POST' });
      alert("System is updating and will restart in the background. Please wait a few seconds and refresh the page manually.");
      setUpdateAvailable(false);
    } catch (e) {
      alert("Failed to initiate update.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-attendance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setParsedData(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
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
        throw new Error('Failed to generate DTR');
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
      alert(`Error generating PDF: ${err.message}`);
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
      alert(`Error generating PDFs: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">DTR Automate</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 font-medium">
            <span className="flex items-center"><Activity className="w-4 h-4 mr-1.5" /> System Active</span>
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

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Streamline your attendance</h2>
          <p className="mt-3 text-base text-gray-500">Upload biometric Excel logs to parse, validate, and generate Daily Time Records in seconds.</p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 hover:bg-gray-50 hover:border-blue-400 transition-all group">
            <div className="bg-gray-50 group-hover:bg-blue-50 p-4 rounded-full transition-colors mb-4">
              <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="flex flex-col items-center text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span className="text-base">Click to upload</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-1">or drag and drop your Excel file here</p>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-mono">.xlsx or .xls up to 10MB</p>
          </div>

          {file && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <File className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-900">{file.name}</span>
                  <span className="block text-xs text-gray-500 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {isUploading ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Parsing Data...</>
                ) : 'Process File'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {parsedData && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Parsed Results
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Found {parsedData.length} employees in the dataset.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="space-y-1.5">
                    <label htmlFor="period" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</label>
                    <input
                      type="text"
                      id="period"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="e.g. July 2026"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="printRange" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Print Range</label>
                    <select
                      id="printRange"
                      value={printRange}
                      onChange={(e) => setPrintRange(e.target.value as any)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                    >
                      <option value="full">Whole Month</option>
                      <option value="1-15">Days 1-15</option>
                      <option value="16-31">Days 16-31</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDownloadAllDTRs}
                    className="inline-flex items-center justify-center px-5 py-2 h-[38px] bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate All DTRs
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {parsedData.map((emp, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-lg">{emp.employeeIdOrName}</span>
                    </div>
                    <button
                      onClick={() => handleDownloadDTR(emp)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                    >
                      <Download className="h-4 w-4 mr-2 text-gray-400" />
                      Download DTR
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm font-mono">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium">Date</th>
                          <th className="px-6 py-3 text-left font-medium">AM In</th>
                          <th className="px-6 py-3 text-left font-medium">AM Out</th>
                          <th className="px-6 py-3 text-left font-medium">PM In</th>
                          <th className="px-6 py-3 text-left font-medium">PM Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white text-gray-600">
                        {emp.records.slice(0, 5).map((record, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50/50">
                            <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{record.date}</td>
                            <td className="px-6 py-3 whitespace-nowrap">{record.amIn || <span className="text-gray-300">-</span>}</td>
                            <td className="px-6 py-3 whitespace-nowrap">{record.amOut || <span className="text-gray-300">-</span>}</td>
                            <td className="px-6 py-3 whitespace-nowrap">{record.pmIn || <span className="text-gray-300">-</span>}</td>
                            <td className="px-6 py-3 whitespace-nowrap">{record.pmOut || <span className="text-gray-300">-</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {emp.records.length > 5 && (
                    <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center font-sans">
                      <span>Showing 5 of {emp.records.length} records.</span>
                      <span className="flex items-center text-blue-600">View more in generated PDF <ChevronRight className="w-3 h-3 ml-1" /></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
