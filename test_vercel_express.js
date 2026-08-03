import express from 'express';

const app = express();
app.use((req, res, next) => {
  // Simulate Vercel setting req.body and consuming the stream
  req.body = { fileData: 'vercel_data' };
  next();
});

app.use(express.json());

app.post('/test', (req, res) => {
  res.json({ body: req.body });
});

app.listen(3003, async () => {
  const res = await fetch('http://localhost:3003/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ express_data: 'express_data' })
  });
  console.log(await res.json());
  process.exit(0);
});
