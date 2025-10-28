import express from 'express';
import dotenv from 'dotenv';
import { AuthController } from '../controllers/authController';
import { validateSignup, validateLogin } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

// Load environment variables FIRST
dotenv.config({ path: '.env' });

const router = express.Router();
const authController = new AuthController();

// POST /api/auth/register - User registration
router.post('/register', validateSignup, (req, res) => authController.register(req, res));

// POST /api/auth/login - User login
router.post('/login', validateLogin, (req, res) => authController.login(req, res));

// POST /api/auth/logout - User logout (optional, mainly for token blacklisting)
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, (req, res) => authController.getProfile(req, res));

export default router;
