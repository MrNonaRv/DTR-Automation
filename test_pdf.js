const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  employeeName: "Test User",
  period: "2026-08",
  records: [],
  printRange: "16-31"
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/generate-dtr',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  const file = fs.createWriteStream("test_dtr.pdf");
  res.pipe(file);
  file.on('finish', () => {
    console.log("PDF downloaded");
  });
});
req.write(data);
req.end();
