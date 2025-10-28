import express from 'express';
import { DepartmentController } from '../controllers/departmentController';

const router = express.Router();
const departmentController = new DepartmentController();

// GET /api/departments - Get all departments
router.get('/', departmentController.getAllDepartments);

export default router;
