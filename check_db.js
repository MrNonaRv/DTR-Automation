const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const snap = await getDocs(collection(db, 'dtr_sessions'));
  console.log("Total sessions:", snap.size);
  let missing = 0;
  snap.forEach(doc => {
    if (!doc.data().updatedAt) {
      missing++;
    }
  });
  console.log("Sessions missing updatedAt:", missing);
}
run().catch(console.error);
