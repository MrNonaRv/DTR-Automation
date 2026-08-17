import React from 'react';
import { X, CheckCircle2, UploadCloud, FileText, Settings, Users, Calendar, Printer } from 'lucide-react';

interface HelpGuideProps {
  onClose: () => void;
}

export default function HelpGuide({ onClose }: HelpGuideProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">How to use DTR Automate</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          
          <div className="space-y-8">
            
            {/* Step 1 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm mr-3">1</span>
                Getting Started: Importing Data
              </h3>
              <div className="pl-9 space-y-3 text-gray-600 leading-relaxed">
                <p>There are two primary ways to generate a DTR:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Upload Excel File:</strong> If you already have an attendance log exported from a Biometric scanner (like a <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.xlsx</code> or <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">.dat</code> file), you can upload it directly on the Home Screen.</li>
                  <li><strong>Blank Template:</strong> If you don't have biometric data and want to manually encode a DTR, click "Create Blank Template (No Biometric)".</li>
                </ul>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2 flex items-start">
                  <Settings className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900"><strong>Pro Tip:</strong> Use the <strong>Scanner Tool</strong> (top right of the home screen) to manage employee rosters and automatically match employee IDs from your `.dat` files to actual names.</p>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm mr-3">2</span>
                Editing and Reviewing DTRs
              </h3>
              <div className="pl-9 space-y-3 text-gray-600 leading-relaxed">
                <p>Once you are in the <strong>Parsed Results</strong> screen, you can review each employee's DTR.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use the <strong>Previous / Next</strong> buttons or the dropdown menu to navigate between employees.</li>
                  <li>You can manually type times into any cell (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">8:00 AM</code>).</li>
                  <li>If an employee forgot to clock in/out, use the <strong>"Automated Duty Auto-Fill"</strong> tool to instantly fill their missing schedules (e.g., standard Monday-Friday shifts).</li>
                  <li>Click <strong>Save to Cloud</strong> to save your editing progress. You can load it later from the Home Screen.</li>
                </ul>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm mr-3">3</span>
                Generating PDFs
              </h3>
              <div className="pl-9 space-y-3 text-gray-600 leading-relaxed">
                <p>When you are ready to print, you can generate the official CSC Form 48 PDFs.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Single Employee:</strong> Click "Download PDF" inside the specific employee's editor view.</li>
                  <li><strong>Batch Generation:</strong> Use the "Batch Generator" panel at the top. You can choose to generate the <strong>Whole Month</strong>, or split it into <strong>Days 1-15</strong> / <strong>Days 16-31</strong>.</li>
                  <li>You can also specify a range of users to print (e.g., entering <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">1-5, 8</code> will only print users 1, 2, 3, 4, 5, and 8).</li>
                </ul>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
}
