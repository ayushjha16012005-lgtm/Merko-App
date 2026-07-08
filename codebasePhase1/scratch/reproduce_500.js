const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function reproduce500() {
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

  // Get a variant to add to cart
  const prods = (await cust.get('/products')).data.data;
  const variantId = prods[0].variants[0].id;
  await cust.post('/cart/items', { productVariantId: variantId, quantity: 1 });

  const testCases = [
    { name: 'POST /orders with non-existent addressId', fn: () => cust.post('/orders', { shippingAddressId: '00000000-0000-0000-0000-000000000000' }) },
    { name: 'POST /orders with invalid addressId format', fn: () => cust.post('/orders', { shippingAddressId: 'invalid-uuid' }) },
  ];

  for (const tc of testCases) {
    try {
      const res = await tc.fn();
      console.log(`[${res.status}] ${tc.name}`);
    } catch (err) {
      console.log(`[${err.response?.status}] ${tc.name}: ${err.response?.data?.error || err.message}`);
      if (err.response?.status === 500) {
        console.error('🔥 FOUND 500 ERROR IN:', tc.name);
        console.error('Full body:', JSON.stringify(err.response?.data, null, 2));
      }
    }
  }
}

reproduce500();
