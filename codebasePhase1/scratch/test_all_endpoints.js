const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function testEndpoints() {
  console.log('--- STARTING COMPREHENSIVE ENDPOINT TESTING ---');
  let customerToken = '';
  let adminToken = '';
  let superAdminToken = '';

  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer@merko.com',
      password: 'customerpassword123'
    });
    customerToken = res.data.data.accessToken;
    console.log('✔ Auth Login Customer: Success');
  } catch (err) {
    console.error('❌ Auth Login Customer failed:', err.response?.status, err.response?.data || err.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@merko.com',
      password: 'adminpassword123'
    });
    adminToken = res.data.data.accessToken;
    console.log('✔ Auth Login Admin: Success');
  } catch (err) {
    console.error('❌ Auth Login Admin failed:', err.response?.status, err.response?.data || err.message);
  }

  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'akshatavnish123@gmail.com',
      password: 'akshatavnish@456'
    });
    superAdminToken = res.data.data.accessToken;
    console.log('✔ Auth Login SuperAdmin: Success');
  } catch (err) {
    console.error('❌ Auth Login SuperAdmin failed:', err.response?.status, err.response?.data || err.message);
  }

  const custClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${customerToken}` } });
  const adminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${adminToken}` } });
  const superAdminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${superAdminToken}` } });

  const endpoints = [
    { name: 'GET /health', call: () => axios.get(`${BASE_URL}/health`) },
    { name: 'GET /categories', call: () => axios.get(`${BASE_URL}/categories`) },
    { name: 'GET /products', call: () => axios.get(`${BASE_URL}/products`) },
    { name: 'GET /profile/addresses', call: () => custClient.get('/profile/addresses') },
    { name: 'GET /cart', call: () => custClient.get('/cart') },
    { name: 'GET /wishlist', call: () => custClient.get('/wishlist') },
    { name: 'GET /orders', call: () => custClient.get('/orders') },
    { name: 'GET /orders/admin (Admin)', call: () => adminClient.get('/orders/admin') },
    { name: 'GET /returns/admin (Admin)', call: () => adminClient.get('/returns/admin') },
    { name: 'GET /users/admin-requests (SuperAdmin)', call: () => superAdminClient.get('/users/admin-requests') },
    { name: 'GET /users/super-admins (SuperAdmin)', call: () => superAdminClient.get('/users/super-admins') },
    { name: 'GET /users/audit-logs (SuperAdmin)', call: () => superAdminClient.get('/users/audit-logs') },
  ];

  for (const ep of endpoints) {
    try {
      const res = await ep.call();
      console.log(`✔ ${ep.name}: HTTP ${res.status}`);
    } catch (err) {
      console.error(`❌ ${ep.name}: HTTP ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
      if (err.response?.status === 500) {
        console.error('SERVER STACK/ERROR:', err.response?.data);
      }
    }
  }
}

testEndpoints();
