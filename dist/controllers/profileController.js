"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { phone, location } = req.body;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        // Find the employee associated with the user
        const employee = await prisma_1.prisma.employee.findFirst({
            where: { userId },
        });
        if (!employee) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }
        // Prepare update data
        const updateData = {};
        if (phone !== undefined)
            updateData.phone = phone;
        if (location !== undefined)
            updateData.location = location;
        // Update employee record
        const updatedEmployee = await prisma_1.prisma.employee.update({
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
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
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
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=profileController.js.map