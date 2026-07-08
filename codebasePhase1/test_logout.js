const { chromium } = require('playwright-core');

async function run() {
  console.log('Starting Playwright...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log network requests and responses
  page.on('request', request => {
    console.log(`[REQ] ${request.method()} ${request.url()}`);
  });
  page.on('response', response => {
    console.log(`[RES] ${response.status()} ${response.url()}`);
  });
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  try {
    console.log('1. Navigating to login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);

    console.log('2. Logging in...');
    await page.fill('input[type="email"]', 'customer@merko.com');
    await page.fill('input[type="password"]', 'customerpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');
    console.log('3. Logged in successfully.');
    await page.waitForTimeout(6000); // Wait for page to hydrate fully

    console.log('4. Locating and clicking logout button in header...');
    // The logout button has title="Logout" or class containing text-red-500. Let's find it.
    const logoutBtn = page.locator('button[title="Logout"], button[title="लॉगआउट"]');
    await logoutBtn.click({ force: true });
    console.log('5. Logout confirmation dialog opened.');
    await page.waitForTimeout(1000);

    const dialogButtons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText));
    console.log('Buttons found after dialog open:', dialogButtons);

    // Locate confirmation button
    const confirmBtn = page.locator('button:has-text("Logout"), button:has-text("लॉगआउट")').last();
    console.log('6. Clicking Logout confirmation button...');
    
    // We expect navigation, let's wait for navigation or state changes
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15005 }).catch(e => console.log('Navigation wait timed out/skipped:', e.message)),
      confirmBtn.click({ force: true })
    ]);

    await page.waitForTimeout(2000);
    console.log('7. Page URL after logout click:', page.url());
    console.log('8. Page content title after logout click:', await page.title());

    // Save debug screenshot and HTML
    await page.screenshot({ path: '/Users/ayushjha/.gemini/antigravity-ide/brain/e7a14bb8-8049-4b4c-b555-017748635de8/logout_debug.png' });
    console.log('9. Screenshot saved to artifacts.');
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    require('fs').writeFileSync('/Users/ayushjha/.gemini/antigravity-ide/brain/e7a14bb8-8049-4b4c-b555-017748635de8/logout_debug.html', bodyHtml);
    console.log('10. Body HTML saved to artifacts.');

  } catch (err) {
    console.error('Test execution error:', err);
    try {
      await page.screenshot({ path: '/Users/ayushjha/.gemini/antigravity-ide/brain/e7a14bb8-8049-4b4c-b555-017748635de8/logout_error.png' });
      const bodyHtml = await page.evaluate(() => document.body.innerHTML);
      require('fs').writeFileSync('/Users/ayushjha/.gemini/antigravity-ide/brain/e7a14bb8-8049-4b4c-b555-017748635de8/logout_error.html', bodyHtml);
      console.log('Saved error screenshot/HTML.');
    } catch (e) {
      console.error('Error saving error screenshot:', e);
    }
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
    console.log('Finished.');
  }
}

run();
