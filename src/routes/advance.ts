import { Router } from 'express';
import { AdvanceController } from '../controllers/advanceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const advanceController = new AdvanceController();

// Create advance request
router.post('/request', authenticateToken, (req, res) => {
  advanceController.createAdvanceRequest(req, res);
});

// Get all advance requests for current user
router.get('/requests', authenticateToken, (req, res) => {
  advanceController.getAdvanceRequests(req, res);
});

// Get single advance request by ID
router.get('/request/:id', authenticateToken, (req, res) => {
  advanceController.getAdvanceRequestById(req, res);
});

export default router;
