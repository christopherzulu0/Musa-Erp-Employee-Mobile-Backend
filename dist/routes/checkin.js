"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkInController_1 = require("../controllers/checkInController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const checkInController = new checkInController_1.CheckInController();
// Debug middleware
router.use((req, res, next) => {
    console.log(`CheckIn Route: ${req.method} ${req.path}`);
    next();
});
// POST /api/checkin - Record check-in/out
router.post('/', auth_1.authenticateToken, (req, res) => {
    console.log('POST /api/checkin called');
    checkInController.createCheckIn(req, res);
});
// POST /api/checkin/request - Submit attendance correction request
router.post('/request', auth_1.authenticateToken, (req, res) => {
    console.log('POST /api/checkin/request called');
    checkInController.submitAttendanceRequest(req, res);
});
// Specific GET routes MUST come before generic GET route
// GET /api/checkin/today - Get today's check-in/out
router.get('/today', auth_1.authenticateToken, (req, res) => checkInController.getTodayCheckIn(req, res));
// GET /api/checkin/monthly-stats - Get this month's attendance stats
router.get('/monthly-stats', auth_1.authenticateToken, (req, res) => checkInController.getMonthlyStats(req, res));
// GET /api/checkin/records - Get attendance records
router.get('/records', auth_1.authenticateToken, (req, res) => checkInController.getAttendanceRecords(req, res));
// Generic GET /api/checkin - Get check-in/out history (must be last)
router.get('/', auth_1.authenticateToken, (req, res) => checkInController.getCheckIns(req, res));
exports.default = router;
//# sourceMappingURL=checkin.js.map