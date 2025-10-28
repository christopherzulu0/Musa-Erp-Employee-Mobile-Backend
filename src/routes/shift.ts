import express from 'express';
import {
    getAvailableShifts,
    getCurrentShift,
    getShiftHistory,
    requestShiftChange
} from '../controllers/shiftController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All shift routes require authentication
router.use(authenticateToken);

// Get current shift assignment
router.get('/current', getCurrentShift);

// Get available shifts
router.get('/available', getAvailableShifts);

// Get shift history
router.get('/assignments', getShiftHistory);

// Request shift change
router.post('/request', requestShiftChange);

export default router;
