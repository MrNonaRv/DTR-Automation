const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(e => console.log('Nav error:', e.message));
  await page.waitForTimeout(2000);
  await browser.close();
})();
