const express = require('express');
const app = express();
app.use((req, res, next) => {
  console.log("req.body before:", req.body);
  next();
});
app.use(express.json());
app.use((req, res, next) => {
  console.log("req.body after:", req.body);
  res.send('ok');
});
app.listen(3004, async () => {
  await fetch('http://localhost:3004/', { method: 'POST', body: '{"a":1}', headers: {'Content-Type': 'application/json'} });
  process.exit(0);
});
