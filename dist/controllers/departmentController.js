"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const prisma_1 = require("../lib/prisma");
class DepartmentController {
    // Get all departments
    async getAllDepartments(req, res) {
        try {
            const departments = await prisma_1.prisma.department.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true
                },
                orderBy: {
                    name: 'asc'
                }
            });
            res.json({
                success: true,
                data: departments
            });
        }
        catch (error) {
            console.error('Get departments error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get departments'
            });
        }
    }
}
exports.DepartmentController = DepartmentController;
//# sourceMappingURL=departmentController.js.map