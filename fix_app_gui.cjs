const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetRegex = /<div className="text-center max-w-2xl mx-auto mb-8">[\s\S]*?\{!parsedData && \([\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*\)\}/;

const targetString = `<div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Streamline your attendance</h2>
          <p className="mt-3 text-base text-gray-500">Upload biometric Excel logs to parse, validate, and generate Daily Time Records in seconds.</p>
        </div>

        {!parsedData && (
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
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setFile(null)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isUploading ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : 'Parse & Validate'}
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
        )}`;

const newHero = `
        {!parsedData && (
          <div className="max-w-4xl mx-auto space-y-8 mt-4">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Simplify Your DTR Generation</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">Convert raw biometric logs to polished PDF Daily Time Records in seconds. Manage employee rosters, parse attendance, and generate reports.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Prepare Data</h3>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">Convert raw .dat files from your biometric scanner into clean Excel workbooks organized by employee name.</p>
                <button 
                  onClick={() => setShowScannerTool(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-teal-200 text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 font-medium text-sm transition-colors w-full"
                >
                  Open Scanner Tool <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
                <div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <File className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">2. Generate DTR</h3>
                  <p className="text-gray-500 mb-6 text-sm leading-relaxed">Upload the formatted Excel workbook to review attendance records and generate individual or bulk PDF reports.</p>
                </div>
                <label 
                  htmlFor="file-upload-direct"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors w-full cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 mr-2" /> Upload Excel File
                </label>
                <input
                  id="file-upload-direct"
                  type="file"
                  className="sr-only"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </div>

            </div>

            {file && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <File className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{file.name}</h4>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setFile(null)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

          </div>
        )}
`;

content = content.replace(targetString, newHero);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed GUI');
