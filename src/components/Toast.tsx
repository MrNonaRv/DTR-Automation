import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white border-green-200',
    error: 'bg-white border-red-200',
    info: 'bg-white border-blue-200'
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-4 border rounded-xl shadow-lg ${bgColors[type]} animate-in slide-in-from-bottom-5 fade-in duration-300 z-50`}>
      <div className="mr-3">{icons[type]}</div>
      <p className="text-sm font-medium text-gray-800 mr-6">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
