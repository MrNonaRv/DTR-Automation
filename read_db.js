const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({ projectId: 'automatic-climate-zgxqk' });
const db = getFirestore('ai-studio-mambusaodtrautom-9a917564-d016-4340-a407-1131e70b9e00');

async function run() {
  const doc = await db.collection('scanner_configs').doc('v1').get();
  const data = doc.data();
  if (data && data.scanner2 && data.scanner2.people) {
    console.log("Scanner 2 people (first 5):");
    console.dir(data.scanner2.people.slice(0, 5), { depth: null });
  } else {
    console.log("No data for scanner2 people");
  }
  process.exit(0);
}
run();
