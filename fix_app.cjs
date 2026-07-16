const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const handleReset = `  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
  };
`;

content = content.replace('  const handleFileChange', handleReset + '\n  const handleFileChange');

const uploadSectionRegex = /<div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">[\s\S]*?<\/div>\s*\{parsedData && \(/;

const newUploadSection = `{!parsedData && (
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
        )}
        
        {parsedData && (`;

content = content.replace(uploadSectionRegex, newUploadSection);

// add a reset button in parsed results header
const parsedResultsHeaderRegex = /<h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">[\s\S]*?<\/h2>/;
const newParsedResultsHeader = `<h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Parsed Results
                  </h2>
                  <button onClick={handleReset} className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline font-medium">
                    Upload a different file
                  </button>`;
content = content.replace(parsedResultsHeaderRegex, newParsedResultsHeader);

fs.writeFileSync('src/App.tsx', content);
