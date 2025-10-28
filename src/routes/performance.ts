import express from 'express';
import { performanceController } from '../controllers/performanceController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/performance/metrics - Get performance metrics
router.get('/metrics', authenticateToken, (req, res) => performanceController.getPerformanceMetrics(req, res));

// GET /api/performance/goals - Get employee goals
router.get('/goals', authenticateToken, (req, res) => performanceController.getGoals(req, res));

// GET /api/performance/energy-points - Get energy points
router.get('/energy-points', authenticateToken, (req, res) => performanceController.getEnergyPoints(req, res));

// GET /api/performance/reviews - Get performance reviews
router.get('/reviews', authenticateToken, (req, res) => performanceController.getPerformanceReviews(req, res));

export default router;
