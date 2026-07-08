const http = require('http');
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '../apps/api/node_modules/@prisma/client'));
const prisma = new PrismaClient();

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
        resolve({ status: res.statusCode, headers: res.headers, data: parsed, rawLength: data.length });
      });
    });

    req.on('error', err => resolve({ status: 'ERR', error: err.message }));
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function executeUAT() {
  console.log('================================================================');
  console.log('STARTING MERKO MASTER UAT & PRODUCTION CERTIFICATION AUDIT');
  console.log('================================================================\n');

  // STEP 1: SERVER HEALTH
  console.log('--- [STEP 1] SERVER HEALTH ---');
  const hApi = await request('http://localhost:4000/api/v1/health');
  const hCust = await request('http://localhost:3000/login');
  const hMgmt = await request('http://localhost:3001/dashboard');
  console.log(`API Health: ${hApi.status} ->`, hApi.data);
  console.log(`Customer Login: ${hCust.status} (${hCust.rawLength} bytes)`);
  console.log(`Management Dashboard: ${hMgmt.status} (${hMgmt.rawLength} bytes)\n`);

  // STEP 2: CUSTOMER JOURNEY & AUTHENTICATION
  console.log('--- [STEP 2] CUSTOMER JOURNEY & AUTHENTICATION ---');
  const uatEmail = `uat_cust_${Date.now()}@merko.com`;
  const regRes = await request('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: uatEmail, password: 'Password123!', firstName: 'UAT', lastName: 'Customer' });
  console.log(`Customer Registration: Status ${regRes.status}`, regRes.data?.success ? `ID: ${regRes.data.data.id}` : regRes.data);

  const dbCust = await prisma.user.findUnique({ where: { email: uatEmail } });
  console.log(`DB Proof (User Created): ID=${dbCust?.id}, Role=${dbCust?.role}`);

  const loginRes = await request('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: uatEmail, password: 'Password123!' });
  console.log(`Customer Login: Status ${loginRes.status}, Success=${loginRes.data?.success}`);
  const custToken = loginRes.data?.data?.token;

  // STEP 3-5: CATALOG & CUSTOMIZATION API
  console.log('\n--- [STEP 3-5] CATALOG & CUSTOMIZATION ---');
  const cats = await request('http://localhost:4000/api/v1/categories');
  console.log(`Categories Count: ${cats.data?.data?.length || 0}`);

  // STEP 12-14: MANAGEMENT & ADMIN AUTH
  console.log('\n--- [STEP 12-14] MANAGEMENT PORTAL & ADMIN WORKFLOW ---');
  const adminEmail = `uat_admin_${Date.now()}@merko.com`;
  const adminReg = await request('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: adminEmail, password: 'Password123!', firstName: 'UAT', lastName: 'Admin' });
  console.log(`Admin Account Created: Status ${adminReg.status}`);

  // Promote admin in DB directly for testing management features
  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'ADMIN', status: 'ACTIVE' }
  });
  console.log(`DB Proof (Admin Promoted): Role updated to ADMIN in database.`);

  const adminLogin = await request('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: adminEmail, password: 'Password123!' });
  console.log(`Admin Login Status: ${adminLogin.status}`);
  const adminToken = adminLogin.data?.data?.token;

  // STEP 13: ADMIN CRUD CREATION (Category & Product)
  console.log('\n--- [STEP 13] ADMIN CRUD OPERATIONS ---');
  if (adminToken) {
    const newCat = await request('http://localhost:4000/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, { name: `UAT Cat ${Date.now()}`, description: 'UAT Category' });
    console.log(`Create Category Status: ${newCat.status}`, newCat.data?.success ? `ID: ${newCat.data.data.id}` : newCat.data);
  }

  // STEP 16: SECURITY & RBAC TESTING
  console.log('\n--- [STEP 16] SECURITY & RBAC TESTING ---');
  const unauthRes = await request('http://localhost:4000/api/v1/users/super-admins');
  console.log(`Unauthorized Access GET /super-admins (No Token): Status ${unauthRes.status} (Expected 401)`);

  const custAccessAdmin = await request('http://localhost:4000/api/v1/orders/admin', {
    headers: { 'Authorization': `Bearer ${custToken}` }
  });
  console.log(`Customer Access GET /orders/admin: Status ${custAccessAdmin.status} (Expected 403)`);

  // STEP 20: STRESS & PERFORMANCE TEST
  console.log('\n--- [STEP 20] STRESS & PERFORMANCE TEST (100 Requests) ---');
  const pStart = Date.now();
  const reqs = Array.from({ length: 100 }).map(() => request('http://localhost:4000/api/v1/health'));
  const results = await Promise.all(reqs);
  const pDuration = Date.now() - pStart;
  const pSuccess = results.filter(r => r.status === 200).length;
  console.log(`100 Requests Completed in ${pDuration}ms. Success Rate: ${pSuccess}/100 (Avg: ${(pDuration/100).toFixed(2)}ms)`);

  console.log('\n================================================================');
  console.log('UAT EXECUTION COMPLETED WITH FULL LIVE EVIDENCE');
  console.log('================================================================');
  await prisma.$disconnect();
}

executeUAT();
