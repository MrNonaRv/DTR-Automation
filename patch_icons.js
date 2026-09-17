const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  "import { UploadCloud, Printer, Save, HelpCircle, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, X, ChevronLeft, CheckCircle2, Trash2, Plus } from 'lucide-react';",
  "import { UploadCloud, Printer, Save, HelpCircle, File, AlertCircle, Download, RefreshCw, Calendar, Users, Activity, ChevronRight, X, ChevronLeft, CheckCircle2, Trash2, Plus, History, Clock } from 'lucide-react';"
);
fs.writeFileSync('src/App.tsx', code);
console.log('patched icons');
