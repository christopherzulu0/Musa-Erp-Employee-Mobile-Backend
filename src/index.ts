import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ path: '.env' });

// Set DATABASE_URL explicitly if not loaded
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_cbHgZ5PSkaD3@ep-blue-paper-adkqzq45-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
}

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './lib/prisma';
import { AttendanceCronService } from './services/attendanceCronService';

// Import routes
import advanceRoutes from './routes/advance';
import authRoutes from './routes/auth';
import checkInRoutes from './routes/checkin';
import departmentRoutes from './routes/departments';
import leaveRoutes from './routes/leave';
import performanceRoutes from './routes/performance';
import profileRoutes from './routes/profile';
import shiftRoutes from './routes/shift';


// Create Express app
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Validate PORT is a valid number
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error('Invalid PORT value:', process.env.PORT);
  process.exit(1);
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'http://localhost:8081', // React Native default
    'http://10.77.233.212:8081', // Network IP for React Native
    'exp://10.77.233.212:8081', // Expo development server
    'http://10.77.233.212:3000', // Backend itself
  ],
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/advance', advanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/shift', shiftRoutes);

// Debug all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize attendance cron service
const attendanceCronService = new AttendanceCronService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  attendanceCronService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  attendanceCronService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Health check: http://10.77.233.212:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🔐 Auth API: http://10.77.233.212:${PORT}/api/auth`);
  
  // Start the attendance cron service
  attendanceCronService.start();
});

export default app;