const puppeteer = require('puppeteer');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head><title>Iframe Test</title></head>
      <body>
        <iframe src="http://localhost:3000" width="100%" height="800px"></iframe>
      </body>
    </html>
  `);
});

server.listen(4000, async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push('LOG: ' + msg.text()));
  page.on('pageerror', err => logs.push('ERROR: ' + err.message));
  
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => logs.push(e.message));
  
  console.log("----- LOGS -----");
  console.log(logs.join('\n'));
  await browser.close();
  server.close();
});
