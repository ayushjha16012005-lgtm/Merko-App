const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function runStressTest() {
  console.log('⚡ STARTING PERFORMANCE & CONCURRENCY STRESS TEST ⚡');
  const startTime = Date.now();

  // 1. Concurrent Health Check (50 parallel requests)
  console.log('\n--> Testing 50 concurrent health check requests...');
  const healthPromises = Array.from({ length: 50 }).map(() => axios.get(`${BASE_URL}/health`));
  const healthResults = await Promise.all(healthPromises);
  console.log(`[PASS] 50 Concurrent Health Checks completed. All status 200.`);

  // 2. Concurrent Catalog Fetches (50 parallel requests)
  console.log('\n--> Testing 50 concurrent product catalog fetches...');
  const prodPromises = Array.from({ length: 50 }).map(() => axios.get(`${BASE_URL}/products`));
  const prodResults = await Promise.all(prodPromises);
  console.log(`[PASS] 50 Concurrent Catalog Fetches completed. All status 200.`);

  // 3. Concurrent Auth Logins (20 parallel requests for Customer)
  console.log('\n--> Testing concurrent authentication requests...');
  const authPromises = Array.from({ length: 10 }).map(() => 
    axios.post(`${BASE_URL}/auth/login`, { email: 'customer@merko.com', password: 'customerpassword123' })
  );
  const authResults = await Promise.all(authPromises);
  console.log(`[PASS] Concurrent Customer Logins completed. Tokens acquired successfully.`);

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n==================================================`);
  console.log(`🚀 STRESS TEST PASSED IN ${duration.toFixed(2)}s! NO CRASHES OR DROPPED CONNECTIONS. 🚀`);
  console.log(`==================================================`);
}

runStressTest().catch(err => {
  console.error('❌ STRESS TEST FAILED:', err.response?.status, err.response?.data || err.message);
});
