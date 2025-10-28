"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const performanceController_1 = require("../controllers/performanceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// GET /api/performance/metrics - Get performance metrics
router.get('/metrics', auth_1.authenticateToken, (req, res) => performanceController_1.performanceController.getPerformanceMetrics(req, res));
// GET /api/performance/goals - Get employee goals
router.get('/goals', auth_1.authenticateToken, (req, res) => performanceController_1.performanceController.getGoals(req, res));
// GET /api/performance/energy-points - Get energy points
router.get('/energy-points', auth_1.authenticateToken, (req, res) => performanceController_1.performanceController.getEnergyPoints(req, res));
// GET /api/performance/reviews - Get performance reviews
router.get('/reviews', auth_1.authenticateToken, (req, res) => performanceController_1.performanceController.getPerformanceReviews(req, res));
exports.default = router;
//# sourceMappingURL=performance.js.map