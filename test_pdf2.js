const http = require('http');
const fs = require('fs');

const data = JSON.stringify({
  period: "2026-08",
  employees: [{
    employeeName: "Test User",
    records: [
      { date: '2026-08-01', amIn: '08:00 AM', amOut: '12:00 PM', pmIn: '01:00 PM', pmOut: '05:00 PM' },
      { date: '2026-08-16', amIn: '08:00 AM', amOut: '12:00 PM', pmIn: '01:00 PM', pmOut: '05:00 PM' }
    ]
  }],
  printRange: "16-31"
});

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/generate-all-dtrs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  const file = fs.createWriteStream("test_all_dtr.pdf");
  res.pipe(file);
  file.on('finish', () => {
    console.log("PDF downloaded");
  });
});
req.write(data);
req.end();
