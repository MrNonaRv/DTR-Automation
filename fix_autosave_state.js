const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);`;

const replace = `  const [file, setFile] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => localStorage.getItem('dtr_sessionId'));
  const [currentSessionName, setCurrentSessionName] = useState<string>(() => localStorage.getItem('dtr_sessionName') || '');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isUploading, setIsUploading] = useState(false);`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed state variables!");
} else {
  console.log("Could not find state variable injection point.");
}
