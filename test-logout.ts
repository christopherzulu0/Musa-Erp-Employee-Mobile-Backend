import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function testLogoutEndpoint() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing logout endpoint...');
  
  try {
    // First, let's try to login to get a token
    console.log('Step 1: Attempting login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json() as any;
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.token) {
      console.log('Step 2: Testing logout with valid token...');
      
      // Now test logout with the token
      const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`,
        },
      });
      
      const logoutData = await logoutResponse.json() as any;
      console.log('Logout response:', logoutData);
      console.log('Logout status:', logoutResponse.status);
      
      if (logoutResponse.ok) {
        console.log('✅ Logout endpoint working correctly');
      } else {
        console.log('❌ Logout endpoint failed');
      }
    } else {
      console.log('ℹ️ Could not get token for logout test (expected for invalid credentials)');
    }
    
  } catch (error) {
    console.error('❌ Logout endpoint test failed:', error);
  }
}

async function testLogoutWithoutToken() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('\nTesting logout without token...');
  
  try {
    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const logoutData = await logoutResponse.json() as any;
    console.log('Logout without token response:', logoutData);
    console.log('Logout without token status:', logoutResponse.status);
    
    if (logoutResponse.status === 401) {
      console.log('✅ Logout endpoint correctly requires authentication');
    } else {
      console.log('❌ Logout endpoint should require authentication');
    }
    
  } catch (error) {
    console.error('❌ Logout without token test failed:', error);
  }
}

async function runTests() {
  await testLogoutEndpoint();
  await testLogoutWithoutToken();
}

runTests();
