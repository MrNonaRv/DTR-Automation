import React, { useState, useEffect } from 'react';
import { UploadCloud, File, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { AttendanceRecord, EmployeeAttendance } from './utils/excelParser';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<EmployeeAttendance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('July 2026'); // Default or input
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
      link.setAttribute('download', `DTR_${emp.employeeIdOrName.replace(/\s+/g, '_')}.pdf`);
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
      link.setAttribute('download', `All_DTRs.pdf`);
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Update Banner */}
        {updateAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">System Update Available</h3>
                <p className="text-sm text-blue-700 mt-1">A new version of the Mambusao DTR Automate system is available. Would you like to update?</p>
              </div>
            </div>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update System'}
            </button>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-3xl font-medium tracking-tight text-gray-900">Mambusao DTR Automate</h1>
          <p className="mt-2 text-sm text-gray-500">Upload biometric Excel logs to parse and generate DTRs.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 hover:bg-gray-50 transition-colors">
            <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">XLSX up to 10MB</p>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <File className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isUploading ? 'Parsing...' : 'Process File'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start space-x-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {parsedData && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-xl font-medium">Parsed Results Overview</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="period" className="text-sm font-medium text-gray-700">Period:</label>
                  <input
                    type="text"
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. July 2026"
                  />
                </div>
                <button
                  onClick={handleDownloadAllDTRs}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate All DTRs
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {parsedData.map((emp, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-medium text-gray-900">Employee: {emp.employeeIdOrName}</span>
                    <button
                      onClick={() => handleDownloadDTR(emp)}
                      className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-2 text-gray-500" />
                      Generate DTR
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Date</th>
                          <th className="px-4 py-2 text-left font-medium">AM In</th>
                          <th className="px-4 py-2 text-left font-medium">AM Out</th>
                          <th className="px-4 py-2 text-left font-medium">PM In</th>
                          <th className="px-4 py-2 text-left font-medium">PM Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {emp.records.slice(0, 5).map((record, rIdx) => (
                          <tr key={rIdx}>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-900">{record.date}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.amIn || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.amOut || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.pmIn || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.pmOut || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {emp.records.length > 5 && (
                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                      Showing 5 of {emp.records.length} records.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
