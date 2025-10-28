import express from 'express';
import { LeaveController } from '../controllers/leaveController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const leaveController = new LeaveController();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Leave Route: ${req.method} ${req.path}`);
  next();
});

// GET /api/leave/balances - Get leave balances for current user
router.get('/balances', authenticateToken, (req, res) => leaveController.getLeaveBalances(req, res));

// GET /api/leave/applications - Get leave applications for current user
router.get('/applications', authenticateToken, (req, res) => leaveController.getLeaveApplications(req, res));

// GET /api/leave/types - Get available leave types
router.get('/types', authenticateToken, (req, res) => leaveController.getLeaveTypes(req, res));

// POST /api/leave/applications - Create new leave application
router.post('/applications', authenticateToken, (req, res) => leaveController.createLeaveApplication(req, res));

// GET /api/leave/upcoming - Get upcoming approved leaves
router.get('/upcoming', authenticateToken, (req, res) => leaveController.getUpcomingLeaves(req, res));

// POST /api/leave/compensatory - Create compensatory leave request
router.post('/compensatory', authenticateToken, (req, res) => leaveController.createCompensatoryLeaveRequest(req, res));

// GET /api/leave/compensatory - Get compensatory leave requests
router.get('/compensatory', authenticateToken, (req, res) => leaveController.getCompensatoryLeaveRequests(req, res));

export default router;
