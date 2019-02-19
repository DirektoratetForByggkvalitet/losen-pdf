const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function getPdf(
  url, 
  { 
    localStorageData = null, 
    localStorageKey = null
  }
) {
  console.log(
    typeof localStorageKey, 
    localStorageKey
  )

  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const page = await browser.newPage();
  await page.goto(url);

  if (localStorageData) {
    await page.evaluate((localStorageKey, localStorageData) => {
      // Set local storage with data from user
      return localStorage.setItem(
        localStorageKey,
        JSON.stringify(localStorageData)
      );
    }, localStorageKey, localStorageData);
    
    await page.reload(1000, { waitUntil: 'networkidle2' });
  }
  
  // Remove the modal overlay if it appears
  try {
    await page.waitForSelector('.ReactModalPortal button', { timeout: 500 });
    await page.click('.ReactModalPortal button');
  } catch(e) {}

  // Return the pdf to the user
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  
  return pdf;
}

module.exports = { getPdf };
