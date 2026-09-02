const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('setLogLevel')) {
  code = code.replace(
    "import { getFirestore } from 'firebase/firestore';",
    "import { getFirestore, setLogLevel } from 'firebase/firestore';\nsetLogLevel('silent');"
  );
  fs.writeFileSync('src/firebase.ts', code);
  console.log("Muted firestore logs.");
}
