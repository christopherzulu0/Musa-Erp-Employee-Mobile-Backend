import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

// Simulate the expressApiService logout method
async function testLogoutFlow() {
  const baseUrl = 'http://10.170.216.203:3000/api';
  
  console.log('Testing logout flow...');
  
  try {
    // Simulate having a token (you would get this from login)
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0MTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkVNUExPWUVFIiwiaWF0IjoxNzYxMjY4OTIyLCJleHAiOjE3NjE4NzM3MjJ9.test';
    
    console.log('Step 1: Testing logout with token...');
    
    const response = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Logout request successful');
    } else {
      console.log('❌ Logout request failed');
    }
    
  } catch (error) {
    console.error('❌ Logout test failed:', error);
  }
}

testLogoutFlow();
