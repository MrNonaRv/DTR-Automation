import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const snap = await getDocs(collection(db, 'dtr_sessions'));
  console.log("Total sessions:", snap.size);
  let missing = 0;
  for (const d of snap.docs) {
    if (!d.data().updatedAt) {
      console.log("Missing updatedAt for doc:", d.id);
      missing++;
      await updateDoc(doc(db, 'dtr_sessions', d.id), {
        updatedAt: serverTimestamp()
      });
    }
  }
  console.log("Fixed sessions:", missing);
  process.exit(0);
}
run().catch(console.error);
