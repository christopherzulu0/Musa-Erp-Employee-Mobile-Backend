"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaveController_1 = require("../controllers/leaveController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const leaveController = new leaveController_1.LeaveController();
// Debug middleware
router.use((req, res, next) => {
    console.log(`Leave Route: ${req.method} ${req.path}`);
    next();
});
// GET /api/leave/balances - Get leave balances for current user
router.get('/balances', auth_1.authenticateToken, (req, res) => leaveController.getLeaveBalances(req, res));
// GET /api/leave/applications - Get leave applications for current user
router.get('/applications', auth_1.authenticateToken, (req, res) => leaveController.getLeaveApplications(req, res));
// GET /api/leave/types - Get available leave types
router.get('/types', auth_1.authenticateToken, (req, res) => leaveController.getLeaveTypes(req, res));
// POST /api/leave/applications - Create new leave application
router.post('/applications', auth_1.authenticateToken, (req, res) => leaveController.createLeaveApplication(req, res));
// GET /api/leave/upcoming - Get upcoming approved leaves
router.get('/upcoming', auth_1.authenticateToken, (req, res) => leaveController.getUpcomingLeaves(req, res));
// POST /api/leave/compensatory - Create compensatory leave request
router.post('/compensatory', auth_1.authenticateToken, (req, res) => leaveController.createCompensatoryLeaveRequest(req, res));
// GET /api/leave/compensatory - Get compensatory leave requests
router.get('/compensatory', auth_1.authenticateToken, (req, res) => leaveController.getCompensatoryLeaveRequests(req, res));
exports.default = router;
//# sourceMappingURL=leave.js.map