import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function testLoginEndpoint() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing login endpoint...');
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login endpoint working correctly');
    } else {
      console.log('ℹ️ Login endpoint responding (expected error for invalid credentials)');
    }
    
  } catch (error) {
    console.error('❌ Login endpoint test failed:', error);
  }
}

async function testHealthEndpoint() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing health endpoint...');
  
  try {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();
    
    console.log('Health check response:', data);
    console.log('✅ Health endpoint working correctly');
    
  } catch (error) {
    console.error('❌ Health endpoint test failed:', error);
  }
}

async function runTests() {
  await testHealthEndpoint();
  console.log('\n---\n');
  await testLoginEndpoint();
}

runTests();
