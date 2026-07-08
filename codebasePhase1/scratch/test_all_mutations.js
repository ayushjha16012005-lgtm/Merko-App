const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function testAllMutations() {
  console.log('--- STARTING ALL MUTATIONS TESTING ---');
  let adminClient, superClient, custClient;

  try {
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'admin@merko.com', password: 'adminpassword123' });
    adminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${adminRes.data.data.accessToken}` } });
  } catch(e) { console.error('Admin login err:', e.response?.data); }

  try {
    const superRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'akshatavnish123@gmail.com', password: 'akshatavnish@456' });
    superClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${superRes.data.data.accessToken}` } });
  } catch(e) { console.error('Super login err:', e.response?.data); }

  try {
    const custRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'customer@merko.com', password: 'customerpassword123' });
    custClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${custRes.data.data.accessToken}` } });
  } catch(e) { console.error('Cust login err:', e.response?.data); }

  // 1. Get a product
  let prod;
  try {
    const prods = (await custClient.get('/products')).data.data;
    prod = prods[0];
  } catch(e) { console.error('Get products err:', e.response?.data); return; }

  // 2. Update Product as superadmin
  console.log('Testing PUT /products/:id');
  try {
    await superClient.put(`/products/${prod.id}`, {
      name: prod.name,
      slug: prod.slug,
      basePrice: Number(prod.basePrice),
      categoryId: prod.categoryId,
    });
    console.log('✔ Update product success');
  } catch (err) {
    console.log('❌ Update product failed:', err.response?.status, err.response?.data);
  }

  // 3. Update Product Status as superadmin
  console.log('Testing PATCH /products/:id/status');
  try {
    await superClient.patch(`/products/${prod.id}/status`, { isActive: true });
    console.log('✔ Update product status success');
  } catch (err) {
    console.log('❌ Update product status failed:', err.response?.status, err.response?.data);
  }

  // 4. Test Categories CRUD
  const cats = (await custClient.get('/categories')).data.data;
  const cat = cats[0];
  console.log('Testing PUT /categories/:id');
  try {
    await superClient.put(`/categories/${cat.id}`, { name: cat.name, slug: cat.slug });
    console.log('✔ Update category success');
  } catch (err) {
    console.log('❌ Update category failed:', err.response?.status, err.response?.data);
  }

  // 5. Test Profile Update
  console.log('Testing PUT /profile');
  try {
    await custClient.put('/profile', { firstName: 'Sarah', lastName: 'Connor' });
    console.log('✔ Update profile success');
  } catch (err) {
    console.log('❌ Update profile failed:', err.response?.status, err.response?.data);
  }

  // 6. Test Wishlist
  console.log('Testing POST /wishlist');
  try {
    await custClient.post('/wishlist', { productId: prod.id });
    console.log('✔ Add to wishlist success');
  } catch (err) {
    console.log('❌ Add to wishlist failed:', err.response?.status, err.response?.data);
  }

  console.log('Testing DELETE /wishlist/:productId');
  try {
    await custClient.delete(`/wishlist/${prod.id}`);
    console.log('✔ Remove from wishlist success');
  } catch (err) {
    console.log('❌ Remove from wishlist failed:', err.response?.status, err.response?.data);
  }
}

testAllMutations();
