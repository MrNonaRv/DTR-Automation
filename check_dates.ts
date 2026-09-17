import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const snap = await getDocs(collection(db, 'dtr_sessions'));
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Session: ${data.name}`);
    console.log(`- updatedAt type:`, typeof data.updatedAt);
    console.log(`- updatedAt value:`, data.updatedAt);
  });
  process.exit(0);
}
run().catch(console.error);
