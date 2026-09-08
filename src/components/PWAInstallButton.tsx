import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
      >
        <Download className="w-4 h-4" />
        Install App
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Install App</h3>
            
            {isIOS ? (
              <p className="mt-2 text-sm text-gray-600">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                To install this app on your device, look for the install icon 
                in your browser's address bar, or open your browser's menu and 
                select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
              </p>
            )}
            
            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
