import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { phone, location } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Find the employee associated with the user
    const employee = await prisma.employee.findFirst({
      where: { userId },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Prepare update data
    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;

    // Update employee record
    const updatedEmployee = await prisma.employee.update({
      where: { id: employee.id },
      data: updateData,
      include: {
        department: true,
        manager: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedEmployee.user,
        employee: {
          id: updatedEmployee.id,
          employeeId: updatedEmployee.employeeId,
          firstName: updatedEmployee.firstName,
          lastName: updatedEmployee.lastName,
          phone: updatedEmployee.phone,
          position: updatedEmployee.position,
          department: updatedEmployee.department,
          manager: updatedEmployee.manager,
          location: updatedEmployee.location,
        },
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
