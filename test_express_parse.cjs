const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.post('/api/upload-attendance', (req, res) => {
  res.json({ keys: Object.keys(req.body) });
});
app.listen(3002, () => {
  const fetch = require('node-fetch');
  fetch('http://localhost:3002/api/upload-attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'test', fileData: 'abc' })
  }).then(r => r.json()).then(console.log).then(() => process.exit(0));
});
