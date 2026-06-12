const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = '/Users/ayushjha/.gemini/antigravity-ide/brain/cb944375-9c89-403f-ab28-88ccc2b00e6b';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 }
};

async function capture(page, name, viewportKey) {
  await page.setViewportSize(VIEWPORTS[viewportKey]);
  await page.waitForTimeout(1000);
  const filename = `${name}_${viewportKey}.png`;
  const filepath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: filepath });
  console.log(`Captured: ${filename}`);
}

async function run() {
  console.log('Launching browser for Customizer screenshots...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Setting desktop viewport...");
    await page.setViewportSize(VIEWPORTS.desktop);

    // 1. Log in
    console.log('Navigating to login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email');
    await page.fill('#email', 'akshatavnish123@gmail.com');
    await page.fill('#password', 'akshatavnish@456');
    await page.click('form button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/`);
    console.log('Logged in successfully!');

    // 2. Go to Catalog and find a customizable product
    await page.goto(`${BASE_URL}/products`);
    await page.waitForSelector('a[href^="/products/"]');
    
    const productLinks = await page.locator('a[href^="/products/"]').all();
    let customizableProductUrl = null;
    
    for (const link of productLinks) {
      const href = await link.getAttribute('href');
      console.log(`Checking product: ${href}`);
      const tempPage = await context.newPage();
      await tempPage.goto(`${BASE_URL}${href}`);
      await tempPage.waitForTimeout(1000);
      const isCustomizable = await tempPage.locator('button:has-text("Open Customization Studio")').first().isVisible();
      await tempPage.close();
      
      if (isCustomizable) {
        customizableProductUrl = href;
        break;
      }
    }

    if (!customizableProductUrl) {
      console.log('No customizable product found, using first product.');
      const firstHref = await productLinks[0].getAttribute('href');
      customizableProductUrl = firstHref;
    }

    console.log(`Selected product details page: ${customizableProductUrl}`);
    await page.goto(`${BASE_URL}${customizableProductUrl}`);
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);

    // Close cart drawer if it is open
    const backdrop = page.locator('.backdrop-blur-sm').first();
    if (await backdrop.isVisible()) {
      console.log('Cart drawer backdrop is visible, closing it...');
      await backdrop.click();
      await page.waitForTimeout(1000);
    }
    const closeBtn = page.locator('button:has(svg.lucide-x), h2:has-text("Shopping Cart") + button').first();
    if (await closeBtn.isVisible()) {
      console.log('Cart drawer close button is visible, closing it...');
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click "Open Customization Studio"
    console.log('Launching Customization Studio...');
    const customizeBtn = page.locator('button:has-text("Open Customization Studio")').first();
    await customizeBtn.click();
    await page.waitForSelector('button:has-text("Exit Studio")');
    console.log('Customization Studio is active!');

    // 3. Add text and style it
    console.log('Adding text overlay...');
    await page.click('aside button:has-text("text")');
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Enter text..."]', 'Premium Merko Brand');
    await page.locator('aside button:has-text("Add")').first().click();
    await page.waitForTimeout(500);
    console.log('Text element added!');

    // Select shape circle
    console.log('Toggling shape mask...');
    await page.click('aside button:has-text("shape")');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("circle")').first().click();
    await page.waitForTimeout(500);

    // Capture Customizer screens for each device size
    await capture(page, 'customizer', 'desktop');
    await capture(page, 'customizer', 'tablet');
    await capture(page, 'customizer', 'mobile');

    // 4. Save design configuration
    console.log('Testing Save Design Modal...');
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Save Design")').first().click();
    await page.waitForSelector('input[placeholder="My Custom Sticker, etc."]');
    await page.fill('input[placeholder="My Custom Sticker, etc."]', 'Test Sticker Print');
    
    // Capture modal screenshot on desktop
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customizer_save_modal.png') });
    console.log('Captured customizer_save_modal.png');

    await page.locator('div.fixed.inset-0.z-50 button:has-text("Save design")').click();
    await page.waitForTimeout(3000); // Allow save design upload merging time

    // 5. Navigate to Profile page and verify saved design is visible
    console.log('Navigating to Profile saved designs tab...');
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForSelector('button:has-text("Saved Designs")');
    await page.click('button:has-text("Saved Designs")');
    await page.waitForTimeout(1000);

    // Capture profile saved designs page
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'profile_saved_designs_library.png') });
    console.log('Captured profile_saved_designs_library.png');

    console.log('All Customizer screenshots captured successfully!');
  } catch (err) {
    console.error('Error during customizer screenshot generation:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'customizer_error_debug.png') });
  } finally {
    await browser.close();
  }
}

run();
