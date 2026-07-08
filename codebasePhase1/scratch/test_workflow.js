const axios = require('../apps/customer/node_modules/axios');

const BASE_URL = 'http://localhost:4000/api/v1';

async function runFullWorkflow() {
  console.log('--- STARTING WORKFLOW TESTING ---');
  try {
    // Login customer
    const custRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'customer@merko.com', password: 'customerpassword123' });
    const custToken = custRes.data.data.accessToken;
    const custClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${custToken}` } });

    // Login admin
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, { email: 'admin@merko.com', password: 'adminpassword123' });
    const adminToken = adminRes.data.data.accessToken;
    const adminClient = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${adminToken}` } });

    // 1. Get Products to find a variant ID
    console.log('Step 1: Fetch products');
    const prodsRes = await custClient.get('/products');
    const products = prodsRes.data.data;
    if (!products || products.length === 0) throw new Error('No products found');
    const firstProd = products[0];
    const variantId = firstProd.variants[0].id;
    console.log(`Using variantId: ${variantId}`);

    // 2. Add to Cart (POST /cart/items)
    console.log('Step 2: Add item to cart');
    const cartRes = await custClient.post('/cart/items', {
      productVariantId: variantId,
      quantity: 1,
      designFileUrl: 'https://example.com/design.png',
      designFileName: 'design.png',
      designFileType: 'image/png'
    });
    console.log('✔ Add to cart successful');

    // 3. Get Address
    console.log('Step 3: Get address');
    const addrsRes = await custClient.get('/profile/addresses');
    const addresses = addrsRes.data.data;
    if (!addresses || addresses.length === 0) throw new Error('No addresses found');
    const addressId = addresses[0].id;

    // 4. Place Order
    console.log('Step 4: Place order');
    const orderRes = await custClient.post('/orders', { shippingAddressId: addressId });
    const order = orderRes.data.data;
    console.log(`✔ Order placed successfully. Order ID: ${order.id}, Number: ${order.orderNumber}`);

    // 5. Create Razorpay Payment Order
    console.log('Step 5: Create payment order');
    const payRes = await custClient.post('/payments/initiate', { orderId: order.id });
    console.log('✔ Payment order created successfully');

    // 6. Verify Payment (mock)
    console.log('Step 6: Verify payment');
    const mockPaymentId = 'pay_mock_' + Date.now();
    const verifyRes = await custClient.post('/payments/verify', {
      orderId: order.id,
      razorpayOrderId: payRes.data.data.gatewayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: 'mock_signature'
    });
    console.log('✔ Payment verified successfully');

    // 7. Admin Update Order Status
    console.log('Step 7: Admin update order status to PRINTING_STARTED');
    const statusRes = await adminClient.put(`/orders/${order.id}/status`, { status: 'PRINTING_STARTED' });
    console.log('✔ Order status updated');

    // 8. Create Shipment
    console.log('Step 8: Create shipment');
    const shipRes = await adminClient.post('/shipments', {
      orderId: order.id,
      courierName: 'BlueDart',
      trackingNumber: 'BD123456789'
    });
    const shipment = shipRes.data.data;
    console.log(`✔ Shipment created ID: ${shipment.id}`);

    // 9. Add Shipment Event & Mark Delivered
    console.log('Step 9: Add shipment event & mark delivered');
    await adminClient.post(`/shipments/${shipment.id}/events`, {
      status: 'DELIVERED',
      description: 'Package delivered to recipient',
      location: 'Mumbai'
    });
    await adminClient.put(`/orders/${order.id}/status`, { status: 'DELIVERED' });
    console.log('✔ Shipment event added & order marked DELIVERED');

    // 10. Customer Return Request
    console.log('Step 10: Customer create return request');
    const returnRes = await custClient.post('/returns', {
      orderId: order.id,
      reason: 'DEFECTIVE_PRODUCT',
      customerNotes: 'Defective printing on front'
    });
    const returnReq = returnRes.data.data;
    console.log(`✔ Return request created ID: ${returnReq.id}`);

    // 11. Admin Update Return Status to RETURN_APPROVED
    console.log('Step 11: Admin approve return request');
    await adminClient.put(`/returns/${returnReq.id}/status`, { status: 'RETURN_APPROVED' });
    console.log('✔ Return request approved');

    // 12. Create Refund
    console.log('Step 12: Admin create refund');
    const dbPayment = (await adminClient.get(`/payments/order/${order.id}`)).data.data;
    await adminClient.post('/refunds', {
      paymentId: dbPayment.id,
      returnRequestId: returnReq.id,
      amount: Number(order.totalAmount),
      reason: 'Customer return approved'
    });
    console.log('✔ Refund created successfully');

    console.log('🎉 WORKFLOW FINISHED WITH ZERO ERRORS!');

  } catch (err) {
    console.error('❌ WORKFLOW ERROR OCCURRED:');
    console.error('Status:', err.response?.status);
    console.error('Data:', JSON.stringify(err.response?.data, null, 2));
    if (err.response?.status === 500) {
      console.error('FULL 500 ERROR STACK:', err.response?.data);
    }
  }
}

runFullWorkflow();
