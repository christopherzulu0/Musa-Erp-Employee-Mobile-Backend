import express from 'express';
import { CheckInController } from '../controllers/checkInController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const checkInController = new CheckInController();

// Debug middleware
router.use((req, res, next) => {
  console.log(`CheckIn Route: ${req.method} ${req.path}`);
  next();
});

// POST /api/checkin - Record check-in/out
router.post('/', authenticateToken, (req, res) => {
  console.log('POST /api/checkin called');
  checkInController.createCheckIn(req, res);
});

// POST /api/checkin/request - Submit attendance correction request
router.post('/request', authenticateToken, (req, res) => {
  console.log('POST /api/checkin/request called');
  checkInController.submitAttendanceRequest(req, res);
});

// Specific GET routes MUST come before generic GET route
// GET /api/checkin/today - Get today's check-in/out
router.get('/today', authenticateToken, (req, res) => checkInController.getTodayCheckIn(req, res));

// GET /api/checkin/monthly-stats - Get this month's attendance stats
router.get('/monthly-stats', authenticateToken, (req, res) => checkInController.getMonthlyStats(req, res));

// GET /api/checkin/records - Get attendance records
router.get('/records', authenticateToken, (req, res) => checkInController.getAttendanceRecords(req, res));

// Generic GET /api/checkin - Get check-in/out history (must be last)
router.get('/', authenticateToken, (req, res) => checkInController.getCheckIns(req, res));

export default router;
