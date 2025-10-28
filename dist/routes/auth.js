"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
// Load environment variables FIRST
dotenv_1.default.config({ path: '.env' });
const router = express_1.default.Router();
const authController = new authController_1.AuthController();
// POST /api/auth/register - User registration
router.post('/register', validation_1.validateSignup, (req, res) => authController.register(req, res));
// POST /api/auth/login - User login
router.post('/login', validation_1.validateLogin, (req, res) => authController.login(req, res));
// POST /api/auth/logout - User logout (optional, mainly for token blacklisting)
router.post('/logout', auth_1.authenticateToken, (req, res) => authController.logout(req, res));
// GET /api/auth/me - Get current user profile
router.get('/me', auth_1.authenticateToken, (req, res) => authController.getProfile(req, res));
exports.default = router;
//# sourceMappingURL=auth.js.map