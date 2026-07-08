const axios = require('/Users/ayushjha/Desktop/CODE-MERKO/Phase1(Architecture)/codebasePhase1/apps/customer/node_modules/axios');

async function test() {
  try {
    await axios.post('http://localhost:4000/api/v1/auth/register', {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'invalid-email', // invalid email format to trigger validation error
      phone: '123', // too short
      password: 'short' // too short
    });
  } catch (err) {
    console.log('--- AXIOS ERROR OBJ ---');
    console.log('err.name:', err.name);
    console.log('err.message:', err.message);
    console.log('err.response.status:', err.response?.status);
    console.log('err.response.data:', JSON.stringify(err.response?.data, null, 2));
    console.log('err.response.headers:', err.response?.headers);
  }
}

test();
