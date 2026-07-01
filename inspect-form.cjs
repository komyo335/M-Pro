const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/sawsmith/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  
  // Get all input fields
  const inputs = await page.$$('input');
  console.log('Found inputs:', inputs.length);
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const name = await input.getAttribute('name');
    console.log('Input:', { type, placeholder, name });
  }
  
  // Get all buttons
  const buttons = await page.$$('button');
  console.log('Found buttons:', buttons.length);
  for (const button of buttons) {
    const text = await button.textContent();
    console.log('Button:', text.trim());
  }
  
  // Click "Create one" link
  await page.click('text=Create one');
  await new Promise(r => setTimeout(r, 500));
  
  // Get register form inputs
  const regInputs = await page.$$('input');
  console.log('\nRegister form inputs:', regInputs.length);
  for (const input of regInputs) {
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const name = await input.getAttribute('name');
    console.log('Input:', { type, placeholder, name });
  }
  
  await browser.close();
})();
