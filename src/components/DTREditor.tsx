import React, { useState, useEffect, memo } from 'react';
import { EmployeeAttendance, AttendanceRecord } from '../utils/excelParser';
import { Download, Users, CheckCircle2, Fingerprint } from 'lucide-react';

interface DTREditorProps {
  index: number;
  employee: EmployeeAttendance;
  period: string;
  printRange?: 'full' | '1-15' | '16-31';
  onUpdate: (index: number, updatedEmployee: EmployeeAttendance) => void;
  onDownload: (employee: EmployeeAttendance) => void;
  autoFillTrigger?: number;
}


const toTitleCase = (str: string) => {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
export const DTREditor = memo(function DTREditor({ index, employee, period, printRange = 'full', onUpdate, onDownload, autoFillTrigger = 0 }: DTREditorProps) {
  const [editedName, setEditedName] = useState(employee.employeeIdOrName);
  const [editedRecords, setEditedRecords] = useState<AttendanceRecord[]>(employee.records);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (autoFillTrigger > 0) {
      setEditedName(employee.employeeIdOrName);
      setEditedRecords(employee.records);
    }
  }, [autoFillTrigger, employee]);

  // Generate 31 days
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  let targetYear = -1;
  let targetMonth = -1;
  const parsedDate = new Date(period);
  if (!isNaN(parsedDate.getTime())) {
    targetYear = parsedDate.getFullYear();
    targetMonth = parsedDate.getMonth() + 1;
  } else if (employee.records.length > 0) {
    const parts = employee.records[0].date.split("-");
    if (parts.length >= 2) {
      targetYear = parseInt(parts[0], 10);
      targetMonth = parseInt(parts[1], 10);
    }
  }

  const getRecordForDay = (day: number) => {
    return editedRecords.find(r => {
      const parts = r.date.split("-");
      if (parts.length < 3) return false;
      const rYear = parseInt(parts[0], 10);
      const rMonth = parseInt(parts[1], 10);
      const rDay = parseInt(parts[2], 10);
      if (targetYear !== -1 && targetMonth !== -1) {
        return rYear === targetYear && rMonth === targetMonth && rDay === day;
      }
      return rDay === day;
    });
  };

  const handleFillNoBiometric = () => {
    let newRecords = [...editedRecords];
    
    days.forEach(day => {
      let isWeekend = false;
      if (targetYear !== -1 && targetMonth !== -1) {
        const date = new Date(targetYear, targetMonth - 1, day);
        if (date.getMonth() === targetMonth - 1) {
          const dayOfWeek = date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) isWeekend = true;
        } else {
          isWeekend = true; // invalid day
        }
      }

      if (isWeekend) return;
      
      const dateStr = targetYear !== -1 && targetMonth !== -1 
        ? `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        : `YYYY-MM-${day.toString().padStart(2, '0')}`;

      const existingRecordIndex = newRecords.findIndex(r => r.date === dateStr);
      if (existingRecordIndex !== -1) {
        const r = { ...newRecords[existingRecordIndex] };
        if (!r.amIn && !r.amOut && !r.pmIn && !r.pmOut) {
          r.amIn = 'No Biometric';
          newRecords[existingRecordIndex] = r;
        }
      } else {
        newRecords.push({
          date: dateStr,
          amIn: 'No Biometric'
        });
      }
    });

    setEditedRecords(newRecords);
    setIsSaved(false);
    setDebouncedSave({
      employeeIdOrName: editedName,
      records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
    });
  };

  const formatTime = (time: string, isAMField: boolean) => {
    if (!time.trim()) return '';
    const clean = time.trim().toUpperCase();
    
    if (/[A-Z]/i.test(clean) && !/\d/.test(clean)) {
      return clean;
    }
    
    const hasExplicitAM = clean.includes('AM');
    const hasExplicitPM = clean.includes('PM');
    
    const digitsOnly = clean.replace(/\D/g, '');
    let hours = 0;
    let minutes = 0;
    
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 2) {
        hours = parseInt(digitsOnly, 10);
        minutes = 0;
      } else if (digitsOnly.length === 3) {
        hours = parseInt(digitsOnly.substring(0, 1), 10);
        minutes = parseInt(digitsOnly.substring(1, 3), 10);
      } else if (digitsOnly.length >= 4) {
        hours = parseInt(digitsOnly.substring(0, 2), 10);
        minutes = parseInt(digitsOnly.substring(2, 4), 10);
      }
      
      let ampm = isAMField ? 'AM' : 'PM';
      
      if (hasExplicitAM) {
        ampm = 'AM';
      } else if (hasExplicitPM) {
        ampm = 'PM';
      } else {
        if (hours === 12) {
          ampm = 'PM'; // 12 noon is PM
        } else if (hours > 12 && hours < 24) {
          ampm = 'PM';
        } else if (hours === 0 || hours === 24) {
          ampm = 'AM';
        }
      }
      
      if (hours > 12 && hours < 24) hours -= 12;
      if (hours === 0 || hours === 24) hours = 12;
      if (minutes > 59) minutes = 59;
      
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    return time;
  };

  const [debouncedSave, setDebouncedSave] = useState<{ employeeIdOrName: string; records: AttendanceRecord[] } | null>(null);

  useEffect(() => {
    if (debouncedSave) {
      const timer = setTimeout(() => {
        onUpdate(index, {
          ...employee,
          employeeIdOrName: debouncedSave.employeeIdOrName,
          records: debouncedSave.records
        });
        setIsSaved(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [debouncedSave, index, employee, onUpdate]);

  const handleRecordChange = (day: number, field: keyof AttendanceRecord, value: string) => {
    const existingRecord = getRecordForDay(day);
    const dateStr = targetYear !== -1 && targetMonth !== -1 
      ? `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      : `YYYY-MM-${day.toString().padStart(2, '0')}`; // Fallback if no period
      
    let newRecords;
    if (existingRecord) {
      newRecords = editedRecords.map(r => r === existingRecord ? { ...r, [field]: value } : r);
    } else {
      newRecords = [...editedRecords, { date: dateStr, [field]: value }];
    }
    setEditedRecords(newRecords);
    setIsSaved(false);
    
    // Auto-save debounced
    setDebouncedSave({
      employeeIdOrName: editedName,
      records: newRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
    });
  };

  const handleRecordBlur = (day: number, field: keyof AttendanceRecord, value: string) => {
    if (!value.trim()) return;
    const isAM = field === 'amIn' || field === 'amOut';
    const formatted = formatTime(value, isAM);
    
    if (formatted !== value) {
      handleRecordChange(day, field, formatted);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = toTitleCase(e.target.value);
    setEditedName(newName);
    setIsSaved(false);
    
    // Auto-save debounced
    setDebouncedSave({
      employeeIdOrName: newName,
      records: editedRecords.filter(r => r.amIn || r.amOut || r.pmIn || r.pmOut)
    });
  };

  

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Top Action Bar */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <span className="font-semibold text-gray-800 text-lg">DTR Form Editor</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm font-medium transition-colors">
            {isSaved ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Saved
              </span>
            ) : (
              <span className="text-gray-500 animate-pulse">Saving...</span>
            )}
          </div>
          <button
            onClick={handleFillNoBiometric}
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Fingerprint className="h-4 w-4 mr-2 text-gray-500" />
            Fill No Biometric
          </button>
          <button
            onClick={() => onDownload(employee)}
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4 mr-2 text-gray-500" />
            Download PDF
          </button>
        </div>
      </div>

      {/* DTR Paper Layout */}
      <div className="p-8 bg-gray-100/50 flex justify-center overflow-x-auto">
        <div className="bg-white border border-gray-300 shadow-md p-8 min-w-[500px] max-w-[600px] font-sans">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h4 className="text-[10px] sm:text-xs font-semibold leading-tight">REPUBLIC OF THE PHILIPPINES</h4>
            <h4 className="text-[10px] sm:text-xs font-semibold leading-tight">PROVINCE OF CAPIZ</h4>
            <h4 className="text-[10px] sm:text-xs font-semibold leading-tight">MUNICIPALITY OF MAMBUSAO</h4>
            <h2 className="text-base sm:text-lg font-bold text-gray-400 mt-4 tracking-widest">DAILY TIME RECORD</h2>
          </div>

          {/* Name & Period */}
          <div className="mb-4 space-y-3">
            <div className="flex items-end border-b border-gray-400 pb-1">
              <span className="font-bold text-xs sm:text-sm mr-2 whitespace-nowrap">NAME:</span>
              <input 
                type="text" 
                value={editedName} 
                onChange={handleNameChange}
                className="flex-1 text-sm sm:text-base font-bold outline-none bg-transparent"
              />
            </div>
            <div className="flex items-end border-b border-gray-400 pb-1">
              <span className="italic font-bold text-xs sm:text-sm mr-2 whitespace-nowrap">For the period of:</span>
              <span className="flex-1 text-sm sm:text-base outline-none bg-transparent">
                {period}{printRange !== 'full' ? <span className="ml-12">{printRange}</span> : null}
              </span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-800 text-xs sm:text-sm text-center">
            <thead>
              <tr>
                <th className="border border-gray-800 py-1 font-bold w-12" rowSpan={2}>DAYS</th>
                <th className="border border-gray-800 py-1 font-bold" colSpan={2}>AM</th>
                <th className="border border-gray-800 py-1 font-bold" colSpan={2}>PM</th>
                <th className="border border-gray-800 py-1 font-bold text-[10px] sm:text-xs" rowSpan={2}>
                  <div>UNDER/</div>
                  <div>OVERTIME</div>
                </th>
              </tr>
              <tr>
                <th className="border border-gray-800 py-1 font-bold">ARRIVAL</th>
                <th className="border border-gray-800 py-1 font-bold">DEPARTURE</th>
                <th className="border border-gray-800 py-1 font-bold">ARRIVAL</th>
                <th className="border border-gray-800 py-1 font-bold">DEPARTURE</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const record = getRecordForDay(day);
                return (
                  <tr key={day}>
                    <td className="border border-gray-800 font-semibold py-0.5">{day}</td>
                    <td className="border border-gray-800 p-0">
                      <input 
                        type="text" 
                        value={record?.amIn || ''} 
                        onChange={(e) => handleRecordChange(day, 'amIn', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'amIn', e.target.value)}
                        className="w-full h-full text-center py-1 outline-none focus:bg-blue-50 transition-colors"
                      />
                    </td>
                    <td className="border border-gray-800 p-0">
                      <input 
                        type="text" 
                        value={record?.amOut || ''} 
                        onChange={(e) => handleRecordChange(day, 'amOut', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'amOut', e.target.value)}
                        className="w-full h-full text-center py-1 outline-none focus:bg-blue-50 transition-colors"
                      />
                    </td>
                    <td className="border border-gray-800 p-0">
                      <input 
                        type="text" 
                        value={record?.pmIn || ''} 
                        onChange={(e) => handleRecordChange(day, 'pmIn', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'pmIn', e.target.value)}
                        className="w-full h-full text-center py-1 outline-none focus:bg-blue-50 transition-colors"
                      />
                    </td>
                    <td className="border border-gray-800 p-0">
                      <input 
                        type="text" 
                        value={record?.pmOut || ''} 
                        onChange={(e) => handleRecordChange(day, 'pmOut', e.target.value)}
                        onBlur={(e) => handleRecordBlur(day, 'pmOut', e.target.value)}
                        className="w-full h-full text-center py-1 outline-none focus:bg-blue-50 transition-colors"
                      />
                    </td>
                    <td className="border border-gray-800 p-0 bg-gray-50/50">
                      {/* Under/Overtime is usually blank in the PDF */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Certification */}
          <div className="mt-4 text-justify">
            <p className="text-[10px] sm:text-xs italic leading-tight text-gray-700">
              I hereby certify in my honor that the above is true and correct report of the hours
              of work performed, record of which was made daily at the time of arrival and
              departure from the office.
            </p>
          </div>
          
          <div className="mt-8 mb-4 border-b border-gray-800 w-full mx-auto"></div>
          <div className="text-center">
            <p className="text-[10px] sm:text-xs font-bold">SIGNATURE OF EMPLOYEE</p>
          </div>

          {/* Admin Signature */}
          <div className="mt-12 flex justify-center">
            <div className="w-4/5 border-b-2 border-dotted border-gray-800 relative">
              {/* This represents the dotted line area */}
            </div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="font-bold text-sm sm:text-base">DESAM D. MONTORIO</h3>
            <p className="text-[10px] sm:text-xs">Municipal Administrator Designate/HRMO V</p>
          </div>

        </div>
      </div>
    </div>
  );
});

