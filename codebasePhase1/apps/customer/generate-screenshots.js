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

async function capture(page, name) {
  // Capture screenshot for each viewport
  for (const [key, viewport] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(viewport);
    // Give layout time to settle
    await page.waitForTimeout(600);
    const filename = `${name}_${key}.png`;
    const filepath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: name !== 'cart_drawer' });
    console.log(`Captured: ${filename}`);
  }
}

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Log in
    console.log('Navigating to login page...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email');
    await page.fill('#email', 'akshatavnish123@gmail.com');
    await page.fill('#password', 'akshatavnish@456');
    await page.click('form button[type="submit"]');
    
    // Wait for authentication and redirect to home
    await page.waitForURL(`${BASE_URL}/`);
    console.log('Logged in successfully!');

    // Capture Home Dashboard
    console.log('Capturing Home Dashboard...');
    await capture(page, 'home');

    // 2. Go to Catalog & Add to Cart -> Cart Drawer
    console.log('Navigating to catalog...');
    await page.goto(`${BASE_URL}/products`);
    await page.waitForSelector('a[href^="/products/"]');

    // Capture Products Catalog
    console.log('Capturing Products Catalog...');
    await capture(page, 'products');
    
    // Click on the first product detail link
    const firstProductLink = await page.locator('a[href^="/products/"]').first();
    const productUrl = await firstProductLink.getAttribute('href');
    console.log(`Navigating to product detail: ${productUrl}`);
    await page.goto(`${BASE_URL}${productUrl}`);
    await page.waitForSelector('button:has-text("Add to Order")');
    
    // Capture Product Detail Page
    console.log('Capturing Product Detail Page...');
    await capture(page, 'product_detail');
    
    // Click first variant button if visible
    await page.waitForSelector('button:has-text("Variant"), button:has-text("Size"), button:has-text("S"), button:has-text("M")');
    const variantBtn = await page.locator('button:has-text("S"), button:has-text("M"), button:has-text("Variant")').first();
    if (await variantBtn.isVisible()) {
      await variantBtn.click();
    }
    
    // Click "Add to Order"
    await page.click('button:has-text("Add to Order")');
    console.log('Clicked Add to Order, waiting for Drawer...');
    
    // Drawer should open and be visible
    await page.waitForSelector('h2:has-text("Shopping Cart")');
    console.log('Cart Drawer is open, capturing screenshots...');
    await capture(page, 'cart_drawer');

    // 3. Close Drawer & navigate to Cart Page
    console.log('Navigating to full Cart page...');
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForSelector('h1:has-text("Shopping Cart")');
    await capture(page, 'cart_page');

    // 4. Proceed to Checkout
    console.log('Navigating to Checkout page...');
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForSelector('h1:has-text("Secure Checkout")');

    // Check if address is selected or needs addition
    await page.waitForTimeout(1000);
    const hasAddress = await page.locator('div:has-text("Phone:")').first().isVisible();
    if (!hasAddress) {
      console.log('No saved address found. Adding a new address...');
      await page.click('button:has-text("Add Address"), button:has-text("Add New Address")');
      await page.waitForSelector('input[placeholder="Sarah Connor"]');
      await page.fill('input[placeholder="Sarah Connor"]', 'Sarah Connor');
      await page.fill('input[placeholder="9876543210"]', '9876543210');
      await page.fill('input[placeholder="123 Cyberdyne Systems Blvd"]', '123 Cyberdyne Systems Blvd');
      await page.fill('input[placeholder="Los Angeles"]', 'Los Angeles');
      await page.fill('input[placeholder="California"]', 'California');
      await page.fill('input[placeholder="90001"]', '90001');
      await page.click('button:has-text("Save Address")');
      await page.waitForTimeout(1000);
    }
    
    await capture(page, 'checkout');

    // 5. Place Order & Redirect to Order details
    console.log('Placing order...');
    await page.click('button:has-text("Place Your Order"), button:has-text("Place Order")');
    await page.waitForURL(/\/orders\/[a-f0-9-]+/);
    console.log(`Redirected to order details page: ${page.url()}`);
    
    // Give tracking details timeline a second to animate
    await page.waitForTimeout(1000);
    await capture(page, 'order_tracking');

    // 6. Profile Settings Tabs
    console.log('Navigating to Profile Page...');
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForSelector('button:has-text("Personal Settings")');
    await capture(page, 'profile_settings');

    // Switch to Saved Designs tab
    console.log('Switching to Saved Designs tab...');
    await page.click('button:has-text("Saved Designs")');
    await page.waitForTimeout(500);
    await capture(page, 'profile_saved_designs');

    // 7. Addresses Book
    console.log('Navigating to Addresses page...');
    await page.goto(`${BASE_URL}/profile/addresses`);
    await page.waitForSelector('h1:has-text("Delivery Addresses")');
    await capture(page, 'addresses');

    console.log('All screen captures saved successfully!');
  } catch (err) {
    console.error('Error during screenshot generation:', err);
    try {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'error_debug.png') });
      console.log('Saved error_debug.png for diagnosis.');
    } catch (e) {
      console.error('Failed to save error screenshot:', e);
    }
  } finally {
    await browser.close();
  }
}

run();
