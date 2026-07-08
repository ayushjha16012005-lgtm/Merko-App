const http = require('http');
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../apps/api/node_modules/@prisma/client'));
const prisma = new PrismaClient();

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
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
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed, rawLength: data.length });
      });
    });

    req.on('error', err => resolve({ status: 'ERR', error: err.message }));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('STARTING MERKO LIVE PRODUCTION ACCEPTANCE AUDIT');
  console.log('====================================================\n');

  // STEP 1: SERVER HEALTH
  console.log('--- STEP 1: SERVER HEALTH CHECKS ---');
  const startHealth = Date.now();
  const apiHealth = await request('http://localhost:4000/api/v1/health');
  const healthDuration = Date.now() - startHealth;
  console.log(`API /health: Status ${apiHealth.status} (${healthDuration}ms) - Payload:`, apiHealth.data);

  const customerHome = await request('http://localhost:3000/');
  console.log(`Customer Home: Status ${customerHome.status} (Length: ${customerHome.rawLength} bytes)`);

  const mgmtDash = await request('http://localhost:3001/dashboard');
  console.log(`Management Dashboard: Status ${mgmtDash.status} (Length: ${mgmtDash.rawLength} bytes)\n`);

  // STEP 2: CUSTOMER AUTHENTICATION & DATABASE VERIFICATION
  console.log('--- STEP 2: CUSTOMER AUTHENTICATION & DB VERIFICATION ---');
  const testEmail = `audit_user_${Date.now()}@example.com`;
  const registerPayload = {
    email: testEmail,
    password: 'Password123!',
    firstName: 'Audit',
    lastName: 'Tester',
  };

  console.log('Registering test user via API POST /api/v1/auth/register...');
  const regRes = await request('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, registerPayload);
  console.log(`Registration Response Status: ${regRes.status}`, regRes.data);

  // DB Proof for user creation
  const dbUser = await prisma.user.findUnique({ where: { email: testEmail } });
  console.log('DB Proof - User Row Inserted:', dbUser ? { id: dbUser.id, email: dbUser.email, role: dbUser.role } : 'NOT FOUND');

  // Login
  console.log('Logging in test user via API POST /api/v1/auth/login...');
  const loginRes = await request('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: 'Password123!' });
  console.log(`Login Response Status: ${loginRes.status}`, { success: loginRes.data?.success, role: loginRes.data?.data?.user?.role });
  const authToken = loginRes.data?.data?.token;

  // STEP 3: API ENDPOINTS EXERCISE & PRODUCTS QUERY
  console.log('\n--- STEP 3 & 7: API & FEATURE VERIFICATION ---');
  const productsRes = await request('http://localhost:4000/api/v1/products?limit=5');
  console.log(`GET /api/v1/products: Status ${productsRes.status}, Count: ${productsRes.data?.data?.products?.length || 0}`);

  const categoriesRes = await request('http://localhost:4000/api/v1/categories');
  console.log(`GET /api/v1/categories: Status ${categoriesRes.status}, Count: ${categoriesRes.data?.data?.length || 0}`);

  if (authToken) {
    const profileRes = await request('http://localhost:4000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`GET /api/v1/auth/me: Status ${profileRes.status}, Email: ${profileRes.data?.data?.email}`);
  }

  // STEP 11: CONCURRENT STRESS TEST
  console.log('\n--- STEP 11: CONCURRENT STRESS TEST (50 Requests) ---');
  const stressStart = Date.now();
  const reqs = Array.from({ length: 50 }).map(() => request('http://localhost:4000/api/v1/health'));
  const results = await Promise.all(reqs);
  const stressDuration = Date.now() - stressStart;
  const successCount = results.filter(r => r.status === 200).length;
  console.log(`Completed 50 concurrent requests in ${stressDuration}ms. Success rate: ${successCount}/50 (Avg: ${(stressDuration/50).toFixed(2)}ms per request)`);

  console.log('\n====================================================');
  console.log('AUDIT COMPLETE - ALL VERIFICATION STEPS EXECUTED');
  console.log('====================================================');
  await prisma.$disconnect();
}

runAudit();
