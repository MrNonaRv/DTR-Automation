const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `Last opened: {session.updatedAt?.toDate ? session.updatedAt.toDate().toLocaleString() : new Date(session.updatedAt).toLocaleString() || 'Recently'}`;
const replace1 = `Last opened: {session.updatedAt ? (session.updatedAt.toDate ? session.updatedAt.toDate().toLocaleString() : (session.updatedAt.seconds ? new Date(session.updatedAt.seconds * 1000).toLocaleString() : 'Recently')) : 'Just now'}`;

code = code.split(target1).join(replace1);

fs.writeFileSync('src/App.tsx', code);
console.log('Date rendering patched');
