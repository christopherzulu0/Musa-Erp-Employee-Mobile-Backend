import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

import * as jwt from 'jsonwebtoken';

function testJWT() {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  
  console.log('Testing JWT functionality...');
  console.log('JWT_SECRET:', JWT_SECRET ? 'Set' : 'Not set');
  console.log('JWT_EXPIRES_IN:', JWT_EXPIRES_IN);
  
  try {
    const payload = { 
      userId: 'test123', 
      email: 'test@example.com',
      role: 'EMPLOYEE' 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    console.log('✅ JWT token generated successfully');
    console.log('Token length:', token.length);
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT token verified successfully');
    console.log('Decoded payload:', decoded);
    
  } catch (error) {
    console.error('❌ JWT test failed:', error);
  }
}

testJWT();
