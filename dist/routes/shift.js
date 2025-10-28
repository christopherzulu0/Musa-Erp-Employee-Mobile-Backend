"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shiftController_1 = require("../controllers/shiftController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All shift routes require authentication
router.use(auth_1.authenticateToken);
// Get current shift assignment
router.get('/current', shiftController_1.getCurrentShift);
// Get available shifts
router.get('/available', shiftController_1.getAvailableShifts);
// Get shift history
router.get('/assignments', shiftController_1.getShiftHistory);
// Request shift change
router.post('/request', shiftController_1.requestShiftChange);
exports.default = router;
//# sourceMappingURL=shift.js.map