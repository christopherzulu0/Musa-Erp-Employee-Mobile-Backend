"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const advanceController_1 = require("../controllers/advanceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const advanceController = new advanceController_1.AdvanceController();
// Create advance request
router.post('/request', auth_1.authenticateToken, (req, res) => {
    advanceController.createAdvanceRequest(req, res);
});
// Get all advance requests for current user
router.get('/requests', auth_1.authenticateToken, (req, res) => {
    advanceController.getAdvanceRequests(req, res);
});
// Get single advance request by ID
router.get('/request/:id', auth_1.authenticateToken, (req, res) => {
    advanceController.getAdvanceRequestById(req, res);
});
exports.default = router;
//# sourceMappingURL=advance.js.map