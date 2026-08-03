const express = require('express');
const app = express();

app.use((req, res, next) => {
  // Simulate Vercel setting req.body and consuming the stream
  req.body = { fileData: 'abc' };
  next();
});

app.use(express.json()); // This might overwrite req.body if it tries to read empty stream

app.post('/test', (req, res) => {
  res.json({ body: req.body });
});

app.listen(3003, () => {
  const fetch = require('node-fetch');
  fetch('http://localhost:3003/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ overwritten: true })
  }).then(r => r.json()).then(console.log).then(() => process.exit(0));
});
