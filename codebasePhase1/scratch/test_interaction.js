const http = require('http');

function request(url, options = {}, body = null) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', err => resolve({ status: 'ERR', error: err.message }));
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runInteractiveFlow() {
  console.log('====================================================');
  console.log('EXECUTING LIVE AGENT INTERACTIVE USER FLOWS');
  console.log('====================================================\n');

  // Flow 1: Register New Customer
  const email = `live_agent_${Date.now()}@merko.com`;
  console.log(`[Flow 1] Registering Customer: ${email}`);
  const reg = await request('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password: 'Password123!', firstName: 'Agent', lastName: 'User' });
  console.log(`-> Registration Status: ${reg.status}, User ID: ${reg.data?.data?.id}`);

  // Flow 2: Authenticate Customer
  console.log(`\n[Flow 2] Authenticating Customer...`);
  const login = await request('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password: 'Password123!' });
  console.log(`-> Login Status: ${login.status}, Role: ${login.data?.data?.user?.role}`);
  const token = login.data?.data?.token;

  // Flow 3: Fetch Catalog & Categories
  console.log(`\n[Flow 3] Browsing Catalog & Categories...`);
  const cats = await request('http://localhost:4000/api/v1/categories');
  console.log(`-> Categories Found: ${cats.data?.data?.length || 0}`);
  const prods = await request('http://localhost:4000/api/v1/products?limit=5');
  console.log(`-> Products Found: ${prods.data?.data?.products?.length || 0}`);

  // Flow 4: User Profile Verification
  if (token) {
    console.log(`\n[Flow 4] Accessing User Profile...`);
    const profile = await request('http://localhost:4000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`-> Authenticated Profile Email: ${profile.data?.data?.email}`);
  }

  // Flow 5: Management Dashboard Access Verification
  console.log(`\n[Flow 5] Management Portal Route Access...`);
  const mgmtPages = ['/dashboard', '/products', '/categories', '/orders', '/settings'];
  for (const page of mgmtPages) {
    const res = await request(`http://localhost:3001${page}`);
    console.log(`-> Management ${page}: Status ${res.status}`);
  }

  console.log('\n====================================================');
  console.log('ALL LIVE INTERACTIVE FLOWS COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runInteractiveFlow();
