"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const departmentController_1 = require("../controllers/departmentController");
const router = express_1.default.Router();
const departmentController = new departmentController_1.DepartmentController();
// GET /api/departments - Get all departments
router.get('/', departmentController.getAllDepartments);
exports.default = router;
//# sourceMappingURL=departments.js.map