import dotenv from 'dotenv';

// Load environment variables with explicit path
dotenv.config({ path: '.env' });

// Set DATABASE_URL explicitly if not loaded
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:87064465@localhost:5432/hr?schema=public';
}

import { PrismaClient } from '@prisma/client';

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful! User count: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
