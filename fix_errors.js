const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Fix updateDoc import
code = code.replace(
  "import { collection, onSnapshot, doc, setDoc, serverTimestamp, writeBatch, deleteDoc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, serverTimestamp, writeBatch, deleteDoc, getDoc, getDocs, query, orderBy, limit, updateDoc } from 'firebase/firestore';"
);

// 2. Fix e => console.error(e)
code = code.replace(/\.catch\(e => console\.error\(e\)\)/g, ".catch((e: any) => console.error(e))");
code = code.replace(/\.catch\(e => console\.error\("Failed to update global sync pointer", e\)\)/g, ".catch((e: any) => console.error(\"Failed to update global sync pointer\", e))");

// 3. Fix nextArray type
code = code.replace("let nextArray = [];", "let nextArray: any[] = [];");
code = code.replace("const dataMap = {};", "const dataMap: any = {};");

// 4. Check setShowAllSessionsModal definition
if (!code.includes("const [showAllSessionsModal, setShowAllSessionsModal]")) {
  code = code.replace(
    "const [showScannerTool, setShowScannerTool] = useState(false);",
    "const [showScannerTool, setShowScannerTool] = useState(false);\n  const [showAllSessionsModal, setShowAllSessionsModal] = useState(false);"
  );
}

fs.writeFileSync('src/App.tsx', code);
console.log('Errors fixed');
