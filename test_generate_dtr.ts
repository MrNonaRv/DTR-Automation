import fetch from 'node-fetch';
const run = async () => {
  const res = await fetch('http://localhost:3000/api/generate-dtr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeName: 'Test',
      period: 'July',
      records: [],
      printRange: 'full'
    })
  });
  if (res.ok) {
    const buf = await res.buffer();
    console.log("PDF Size:", buf.length);
  } else {
    console.log("Error:", await res.text());
  }
}
run();
