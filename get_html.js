const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => {});
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log("----- HTML START -----");
  console.log(html);
  console.log("----- HTML END -----");
  
  await browser.close();
})();
