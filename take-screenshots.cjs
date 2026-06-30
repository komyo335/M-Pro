const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/home/sawsmith/M-Pro/M-Pro/screenshots';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filePath = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`✓ Saved: ${name}`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/sawsmith/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Login page
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await sleep(500);
  await takeScreenshot(page, '01-login.png');

  // 2. Switch to register mode
  await page.click('text=Create one');
  await sleep(500);
  await takeScreenshot(page, '02-register.png');

  // 3. Fill registration form (4 inputs: name, email, password, confirmPassword)
  const inputs = await page.$$('input');
  await inputs[0].fill('Admin User');       // Full Name
  await inputs[1].fill('admin@mpro.com');   // Email
  await inputs[2].fill('admin123');          // Password
  await inputs[3].fill('admin123');          // Confirm Password
  await sleep(300);
  await takeScreenshot(page, '03-register-filled.png');

  // 4. Submit registration
  await page.click('button[type="submit"]');
  await sleep(1500);
  await takeScreenshot(page, '04-after-register.png');

  // Check if we're now on the dashboard
  let bodyText = await page.textContent('body');
  console.log('After register text:', bodyText.substring(0, 200));

  // The account was created successfully — now sign in
  if (bodyText.includes('Account Created') || bodyText.includes('Create a new account')) {
    console.log('Account created, navigating to sign in...');
    // Click "Sign in now" or "Sign in" link
    await page.click('text=Sign in now', { timeout: 3000 }).catch(() =>
      page.click('text=Sign in', { timeout: 3000 })
    );
    await sleep(1000);

    // Fill login form
    const emailField = await page.$('input[type="email"]');
    const passwordField = await page.$('input[type="password"]');
    if (emailField && passwordField) {
      await emailField.fill('admin@mpro.com');
      await passwordField.fill('admin123');
      await page.click('button[type="submit"]');
      await sleep(1500);
    } else {
      console.log('Could not find login inputs');
    }
  }

  bodyText = await page.textContent('body');
  console.log('Dashboard text:', bodyText.substring(0, 300));

  // 5. POS Dashboard (default view after login)
  await sleep(500);
  await takeScreenshot(page, '05-pos-dashboard.png');

  // 6. Orders
  try {
    await page.click('text=Orders', { timeout: 3000 });
    await sleep(500);
    await takeScreenshot(page, '06-orders.png');
  } catch (e) {
    console.log('Orders not found:', e.message);
  }

  // 7. Customers
  try {
    await page.click('text=Customers', { timeout: 3000 });
    await sleep(500);
    await takeScreenshot(page, '07-customers.png');
  } catch (e) {
    console.log('Customers not found:', e.message);
  }

  // 8. Reports
  try {
    await page.click('text=Reports', { timeout: 3000 });
    await sleep(500);
    await takeScreenshot(page, '08-reports.png');
  } catch (e) {
    console.log('Reports not found:', e.message);
  }

  // 9. Settings
  try {
    await page.click('text=Settings', { timeout: 3000 });
    await sleep(500);
    await takeScreenshot(page, '09-settings.png');
  } catch (e) {
    console.log('Settings not found:', e.message);
  }

  // 10. Staff (might be in sidebar footer)
  try {
    await page.click('text=Staff', { timeout: 3000 });
    await sleep(500);
    await takeScreenshot(page, '10-staff.png');
  } catch (e) {
    console.log('Staff not found:', e.message);
  }

  // 11. Go back to POS and try adding items
  try {
    await page.click('text=POS', { timeout: 3000 });
    await sleep(500);

    // Click on product cards to add to cart
    const cards = await page.$$('div[class*="cursor-pointer"]');
    if (cards.length > 0) {
      await cards[0].click();
      await sleep(300);
      if (cards.length > 1) {
        await cards[1].click();
        await sleep(300);
      }
    }
    await takeScreenshot(page, '11-pos-with-cart.png');
  } catch (e) {
    console.log('POS not found:', e.message);
  }

  console.log('\n✅ All screenshots captured!');
  await browser.close();
})();
