const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function runRegression() {
  console.log('=== STARTING FULL REGRESSION TEST ===');

  // 1. Health Check
  const health = await axios.get(`${BASE_URL}/health`);
  console.log('[PASS] Health Check:', health.status, health.data.server);

  // 2. Customer Auth (Login, Me, Profile)
  const custLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'customer@merko.com',
    password: 'customerpassword123'
  });
  console.log('[PASS] Customer Login:', custLogin.status);
  const custToken = custLogin.data.data.accessToken;
  const custClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${custToken}` } });

  const me = await custClient.get('/auth/me');
  console.log('[PASS] GET /auth/me:', me.status, me.data.data.email);

  // 3. Super Admin Auth
  const superLogin = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'akshatavnish123@gmail.com',
    password: 'akshatavnish@456'
  });
  console.log('[PASS] Super Admin Login:', superLogin.status);
  const superToken = superLogin.data.data.accessToken;
  const superClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${superToken}` } });

  // 4. Products & Categories Catalog
  const categories = await custClient.get('/categories');
  console.log('[PASS] GET /categories:', categories.status, `Count: ${categories.data.data.length}`);

  const products = await custClient.get('/products');
  console.log('[PASS] GET /products:', products.status, `Count: ${products.data.data.length}`);
  const firstProd = products.data.data[0];

  // 5. Wishlist Flow
  const addWishlist = await custClient.post('/wishlist', { productId: firstProd.id });
  console.log('[PASS] POST /wishlist:', addWishlist.status);
  const getWishlist = await custClient.get('/wishlist');
  console.log('[PASS] GET /wishlist:', getWishlist.status, `Count: ${getWishlist.data.data.length}`);
  const delWishlist = await custClient.delete(`/wishlist/${firstProd.id}`);
  console.log('[PASS] DELETE /wishlist/:id:', delWishlist.status);

  // 6. Cart Flow
  const variantId = firstProd.variants[0].id;
  const addToCart = await custClient.post('/cart/items', { productVariantId: variantId, quantity: 2 });
  console.log('[PASS] POST /cart/items:', addToCart.status);
  const getCart = await custClient.get('/cart');
  console.log('[PASS] GET /cart:', getCart.status, `Items: ${getCart.data.data.items.length}`);

  // 7. Order & Payment Flow
  const addresses = await custClient.get('/profile/addresses');
  let addrId;
  if (addresses.data.data.length > 0) {
    addrId = addresses.data.data[0].id;
  } else {
    const newAddr = await custClient.post('/profile/addresses', {
      name: 'John Doe',
      phone: '9876543210',
      addressLine1: '123 Test St',
      city: 'Testville',
      state: 'Test State',
      postalCode: '123456',
      country: 'India',
      isDefault: true
    });
    addrId = newAddr.data.data.id;
  }

  const createOrder = await custClient.post('/orders', { shippingAddressId: addrId });
  console.log('[PASS] POST /orders:', createOrder.status, `Order #: ${createOrder.data.data.orderNumber}`);
  const orderId = createOrder.data.data.id;

  const initPayment = await custClient.post('/payments/initiate', { orderId });
  console.log('[PASS] POST /payments/initiate:', initPayment.status, `Payment Provider: ${initPayment.data.data.provider || 'RAZORPAY'}`);

  const verifyPayment = await custClient.post('/payments/verify', {
    orderId,
    razorpayOrderId: initPayment.data.data.gatewayOrderId,
    razorpayPaymentId: 'pay_mock_' + Date.now(),
    razorpaySignature: 'mock_signature'
  });
  console.log('[PASS] POST /payments/verify:', verifyPayment.status, `Status: ${verifyPayment.data.data.status}`);

  // 8. Order Management (Admin Update Order Status)
  const updateOrder = await superClient.put(`/orders/${orderId}/status`, { status: 'PRINTING_STARTED' });
  console.log('[PASS] PUT /orders/:id/status:', updateOrder.status, `New Status: ${updateOrder.data.data.status}`);

  // 9. Shipment & Logistics Flow
  const createShipment = await superClient.post('/shipments', {
    orderId,
    courierName: 'BlueDart',
    trackingNumber: 'BD' + Date.now()
  });
  console.log('[PASS] POST /shipments:', createShipment.status, `Tracking: ${createShipment.data.data.trackingNumber}`);

  const updateShipment = await superClient.post(`/shipments/${createShipment.data.data.id}/events`, { location: 'Central Sorting Hub', description: 'Package arrived at sorting hub', status: 'IN_TRANSIT' });
  console.log('[PASS] POST /shipments/:id/events:', updateShipment.status, `Status: ${updateShipment.data.data.status}`);

  // Set Order to DELIVERED for Return eligibility
  await superClient.put(`/orders/${orderId}/status`, { status: 'DELIVERED' });

  // 10. Return & Refund Flow
  const createReturn = await custClient.post('/returns', {
    orderId,
    reason: 'DEFECTIVE_PRODUCT',
    comments: 'Item was damaged during transit.'
  });
  console.log('[PASS] POST /returns:', createReturn.status, `Return ID: ${createReturn.data.data.id}`);
  const returnId = createReturn.data.data.id;

  const updateReturn = await superClient.put(`/returns/${returnId}/status`, { status: 'RETURN_APPROVED' });
  console.log('[PASS] PUT /returns/:id/status:', updateReturn.status, `Status: ${updateReturn.data.data.status}`);

  const getPayment = await superClient.get(`/payments/order/${orderId}`);
  const paymentId = getPayment.data.data.id;

  const createRefund = await superClient.post('/refunds', {
    paymentId,
    returnRequestId: returnId,
    amount: Number(getPayment.data.data.amount),
    reason: 'Product return approved'
  });
  console.log('[PASS] POST /refunds:', createRefund.status, `Refund ID: ${createRefund.data.data.id}`);

  // 11. Management & Audit Logs Verification
  const auditLogs = await superClient.get('/users/audit-logs');
  console.log('[PASS] GET /users/audit-logs:', auditLogs.status, `Logs Count: ${auditLogs.data.data.length}`);

  console.log('\n==================================================');
  console.log('🎉 ALL REGRESSION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('==================================================');
}

runRegression().catch(err => {
  console.error('❌ REGRESSION FAILED:', err.response?.status, err.response?.data || err.message);
});
