import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class DepartmentController {
  // Get all departments
  async getAllDepartments(req: Request, res: Response) {
    try {
      const departments = await prisma.department.findMany({
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

    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get departments'
      });
    }
  }
}
