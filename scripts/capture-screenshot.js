const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshot() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 880, height: 660 });
    
    console.log('Navegando a http://localhost:8000/...');
    await page.goto('http://localhost:8000/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    const screenshotPath = path.join(__dirname, '..', 'screenshot.png');
    
    console.log('Capturando screenshot...');
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      clip: { x: 0, y: 0, width: 880, height: 660 }
    });
    
    console.log(`Screenshot guardado en: ${screenshotPath}`);
    
  } catch (error) {
    console.error('Error al capturar screenshot:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshot();