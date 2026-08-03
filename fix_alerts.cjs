const fs = require('fs');
let content = fs.readFileSync('src/components/ScannerTool.tsx', 'utf8');

content = content.replace("import ExcelJS from 'exceljs';", "import ExcelJS from 'exceljs';\nimport { Toast, ToastType } from './Toast';");

content = content.replace("export function ScannerTool({ onClose }: { onClose: () => void }) {", "export function ScannerTool({ onClose }: { onClose: () => void }) {\n  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);");

content = content.replace("alert('No worksheet found in the file.');", "setToast({ message: 'No worksheet found in the file.', type: 'error' });");
content = content.replace("alert(`${data[key].label} list imported from ${file.name}`);", "setToast({ message: `${data[key].label} list imported from ${file.name}`, type: 'success' });");
content = content.replace("alert('Failed to import file');", "setToast({ message: 'Failed to import file', type: 'error' });");
content = content.replace("alert('Please choose a .dat or .xlsx file');", "setToast({ message: 'Please choose a .dat or .xlsx file', type: 'error' });");

// Add toast component render before final </div>
content = content.replace("    </div>\n  );\n}", "      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}\n    </div>\n  );\n}");

fs.writeFileSync('src/components/ScannerTool.tsx', content);
console.log('Fixed ScannerTool.tsx');
