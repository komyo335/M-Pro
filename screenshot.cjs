const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  // 1. Login page
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshots/login-page.png', fullPage: true });
  console.log('✓ Login page screenshot saved');

  // 2. Log in
  await page.fill('#email', 'demo@example.com');
  await page.fill('#password', 'password123');
  await page.click('.login-submit');
  await page.waitForSelector('.pos-dashboard', { timeout: 5000 });
  await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });
  console.log('✓ Dashboard screenshot saved');

  // 3. Dashboard with items in cart
  await page.click('.pos-product-card:nth-child(1)'); // Coffee
  await page.click('.pos-product-card:nth-child(2)'); // Tea
  await page.click('.pos-product-card:nth-child(5)'); // Sandwich
  await page.screenshot({ path: 'screenshots/dashboard-with-cart.png', fullPage: true });
  console.log('✓ Dashboard with cart items screenshot saved');

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/');
})();
