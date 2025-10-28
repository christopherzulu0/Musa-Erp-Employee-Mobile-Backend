import express from 'express';
import * as profileController from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Update profile
router.put('/update', profileController.updateProfile);

// Change password
router.put('/password', profileController.changePassword);

export default router;
