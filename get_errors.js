const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push('LOG: ' + msg.text()));
  page.on('pageerror', err => logs.push('ERROR: ' + err.message));
  page.on('requestfailed', request => {
    logs.push('REQ FAILED: ' + request.url() + ' ' + request.failure().errorText);
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch(e) {
    logs.push('GOTO ERROR: ' + e.message);
  }
  
  console.log("----- BROWSER LOGS -----");
  console.log(logs.join('\n'));
  
  await browser.close();
})();
