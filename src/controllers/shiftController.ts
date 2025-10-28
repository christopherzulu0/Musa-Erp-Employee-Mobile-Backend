import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get employee ID from user ID
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const employeeId = employee.id;

    // Find the current active shift assignment
    const currentAssignment = await prisma.shiftAssignment.findFirst({
      where: {
        employeeId,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      include: {
        shift: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    if (!currentAssignment) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: {
        ...currentAssignment.shift,
        startDate: currentAssignment.startDate,
        endDate: currentAssignment.endDate
      }
    });
  } catch (error) {
    console.error('Error fetching current shift:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch current shift' });
  }
};

export const getAvailableShifts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get all shift types from ShiftType model
    const shiftTypes = await prisma.shiftType.findMany({
      where: {
        isActive: true
      }
    });

    // Get employee counts by matching shift type names with shift assignments
    const shiftsWithData = await Promise.all(
      shiftTypes.map(async (shiftType) => {
        // Count employees assigned to shifts that match this shift type's name
        const employeeCount = await prisma.shiftAssignment.count({
          where: {
            shift: {
              name: shiftType.name,
              isActive: true
            },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        });

        return {
          id: shiftType.id,
          name: shiftType.name,
          startTime: shiftType.startTime,
          endTime: shiftType.endTime,
          category: shiftType.category,
          employeeCount: employeeCount
        };
      })
    );

    res.json({ success: true, data: shiftsWithData });
  } catch (error) {
    console.error('Error fetching available shifts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch available shifts' });
  }
};

export const getShiftHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get employee ID from user ID
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const employeeId = employee.id;

    const assignments = await prisma.shiftAssignment.findMany({
      where: { employeeId },
      include: {
        shift: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    const history = assignments.map(assignment => ({
      id: assignment.id,
      shiftName: assignment.shift.name,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      status: assignment.endDate && assignment.endDate < new Date() ? 'COMPLETED' : 'ACTIVE'
    }));

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching shift history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch shift history' });
  }
};

export const requestShiftChange = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get employee ID from user ID
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    const employeeId = employee.id;

    const { shiftId, effectiveDate, reason } = req.body;

    if (!shiftId || !effectiveDate) {
      return res.status(400).json({ success: false, error: 'Shift ID and effective date are required' });
    }

    // Verify the shift type exists
    const shiftType = await prisma.shiftType.findUnique({
      where: { id: shiftId }
    });

    if (!shiftType) {
      return res.status(404).json({ success: false, error: 'Shift type not found' });
    }

    // Find or create the actual Shift record that corresponds to this ShiftType
    let shift = await prisma.shift.findFirst({
      where: {
        name: shiftType.name,
        isActive: true
      }
    });

    // If no shift exists, create one based on the shift type
    if (!shift) {
      shift = await prisma.shift.create({
        data: {
          name: shiftType.name,
          startTime: shiftType.startTime,
          endTime: shiftType.endTime,
          isActive: true
        }
      });
    }

    const shiftDbId = shift.id;

    // TODO: Create a shift change request record
    // For now, just create a new shift assignment
    const effectiveDateObj = new Date(effectiveDate);
    
    // End the current assignment
    await prisma.shiftAssignment.updateMany({
      where: {
        employeeId,
        endDate: null
      },
      data: {
        endDate: effectiveDateObj
      }
    });

    // Create new assignment with the actual shift ID
    const newAssignment = await prisma.shiftAssignment.create({
      data: {
        employeeId,
        shiftId: shiftDbId,
        startDate: effectiveDateObj
      },
      include: {
        shift: true
      }
    });

    res.json({
      success: true,
      data: newAssignment,
      message: 'Shift change request submitted successfully'
    });
  } catch (error) {
    console.error('Error requesting shift change:', error);
    res.status(500).json({ success: false, error: 'Failed to request shift change' });
  }
};
