const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function testExtensive() {
  let custToken, superToken;
  try {
    const custRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'customer@merko.com', password: 'customerpassword123' });
    custToken = custRes.data.data.accessToken;
    const superRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'akshatavnish123@gmail.com', password: 'akshatavnish@456' });
    superToken = superRes.data.data.accessToken;
  } catch(e) {
    console.error('Login failed:', e.response?.data);
    return;
  }

  const cust = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${custToken}` } });
  const superAdmin = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${superToken}` } });

  const tests = [
    { name: 'GET /health', fn: () => axios.get(`${BASE_URL}/health`) },
    { name: 'GET /categories', fn: () => axios.get(`${BASE_URL}/categories`) },
    { name: 'GET /categories/invalid-id', fn: () => axios.get(`${BASE_URL}/categories/invalid-id`) },
    { name: 'GET /products', fn: () => axios.get(`${BASE_URL}/products`) },
    { name: 'GET /products/invalid-id', fn: () => axios.get(`${BASE_URL}/products/invalid-id`) },
    { name: 'GET /products/slug/invalid-slug', fn: () => axios.get(`${BASE_URL}/products/slug/invalid-slug`) },
    { name: 'GET /cart', fn: () => cust.get('/cart') },
    { name: 'GET /wishlist', fn: () => cust.get('/wishlist') },
    { name: 'GET /orders', fn: () => cust.get('/orders') },
    { name: 'GET /orders/invalid-id', fn: () => cust.get('/orders/invalid-id') },
    { name: 'GET /orders/admin', fn: () => superAdmin.get('/orders/admin') },
    { name: 'GET /payments/order/invalid-id', fn: () => superAdmin.get('/payments/order/invalid-id') },
    { name: 'GET /shipments/order/invalid-id', fn: () => superAdmin.get('/shipments/order/invalid-id') },
    { name: 'GET /returns/admin', fn: () => superAdmin.get('/returns/admin') },
    { name: 'GET /returns/invalid-id', fn: () => superAdmin.get('/returns/invalid-id') },
    { name: 'GET /refunds/order/invalid-id', fn: () => superAdmin.get('/refunds/order/invalid-id') },
    { name: 'GET /users/admin-requests', fn: () => superAdmin.get('/users/admin-requests') },
    { name: 'GET /users/super-admins', fn: () => superAdmin.get('/users/super-admins') },
    { name: 'GET /users/audit-logs', fn: () => superAdmin.get('/users/audit-logs') },
    { name: 'GET /users/invalid-id', fn: () => superAdmin.get('/users/invalid-id') },
  ];

  for (const t of tests) {
    try {
      const res = await t.fn();
      console.log(`[${res.status}] ${t.name}`);
    } catch (err) {
      console.log(`[${err.response?.status}] ${t.name}: ${err.response?.data?.error || err.message}`);
      if (err.response?.status === 500) {
        console.error('🔥 FOUND 500 ERROR IN:', t.name);
        console.error('Response data:', JSON.stringify(err.response?.data, null, 2));
      }
    }
  }
}

testExtensive();
