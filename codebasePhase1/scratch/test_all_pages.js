const http = require('http');

function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, length: body.length, hasError: body.includes('Internal Server Error') || body.includes('Unhandled Runtime Error') });
      });
    }).on('error', (err) => {
      resolve({ status: 'ERR', error: err.message });
    });
  });
}

async function runTests() {
  const customerUrls = [
    'http://localhost:3000/',
    'http://localhost:3000/login',
    'http://localhost:3000/register',
    'http://localhost:3000/forgot-password',
    'http://localhost:3000/reset-password',
    'http://localhost:3000/products',
    'http://localhost:3000/cart',
    'http://localhost:3000/checkout',
    'http://localhost:3000/orders',
    'http://localhost:3000/profile',
    'http://localhost:3000/wishlist',
  ];

  const managementUrls = [
    'http://localhost:3001/dashboard',
    'http://localhost:3001/products',
    'http://localhost:3001/categories',
    'http://localhost:3001/orders',
    'http://localhost:3001/shipments',
    'http://localhost:3001/returns',
    'http://localhost:3001/refunds',
    'http://localhost:3001/payments',
    'http://localhost:3001/analytics',
    'http://localhost:3001/access-requests',
    'http://localhost:3001/super-admins',
    'http://localhost:3001/audit-logs',
    'http://localhost:3001/settings',
  ];

  console.log('--- TESTING CUSTOMER PORTAL PAGES ---');
  for (const u of customerUrls) {
    const res = await testUrl(u);
    console.log(`[${res.status}] ${u} (Length: ${res.length}, Error: ${res.hasError})`);
  }

  console.log('\n--- TESTING MANAGEMENT PORTAL PAGES ---');
  for (const u of managementUrls) {
    const res = await testUrl(u);
    console.log(`[${res.status}] ${u} (Length: ${res.length}, Error: ${res.hasError})`);
  }
}

runTests();
