"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveController = void 0;
const prisma_1 = require("../lib/prisma");
class LeaveController {
    // Get leave balances for current user
    async getLeaveBalances(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'User not authenticated' });
            }
            // Get current leave period
            const currentPeriod = await prisma_1.prisma.leavePeriod.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' }
            });
            if (!currentPeriod) {
                return res.status(404).json({ success: false, error: 'No active leave period found' });
            }
            // Get employee
            const employee = await prisma_1.prisma.employee.findFirst({
                where: { userId },
                include: { department: true }
            });
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }
            // Get leave allocations for current period
            const allocations = await prisma_1.prisma.leaveAllocation.findMany({
                where: {
                    employeeId: employee.id,
                    periodId: currentPeriod.id
                },
                include: {
                    leaveType: true
                }
            });
            // Get used days from applications
            const applications = await prisma_1.prisma.leaveApplication.findMany({
                where: {
                    employeeId: employee.id,
                    status: { in: ['APPROVED', 'PENDING'] },
                    startDate: { gte: currentPeriod.startDate },
                    endDate: { lte: currentPeriod.endDate }
                }
            });
            // Calculate balances
            const balances = allocations.map(allocation => {
                const usedDays = applications
                    .filter(app => app.leaveTypeId === allocation.leaveTypeId)
                    .reduce((sum, app) => sum + Number(app.totalDays), 0);
                return {
                    id: allocation.id,
                    type: allocation.leaveType.name,
                    total: Number(allocation.allocatedDays),
                    used: usedDays,
                    remaining: Number(allocation.remainingDays) - usedDays,
                    description: allocation.leaveType.description,
                    carryForward: allocation.leaveType.carryForward,
                    encashable: allocation.leaveType.encashable
                };
            });
            res.json({ success: true, data: balances });
        }
        catch (error) {
            console.error('Error fetching leave balances:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch leave balances' });
        }
    }
    // Get leave applications for current user
    async getLeaveApplications(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'User not authenticated' });
            }
            const employee = await prisma_1.prisma.employee.findFirst({
                where: { userId }
            });
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }
            const applications = await prisma_1.prisma.leaveApplication.findMany({
                where: { employeeId: employee.id },
                include: {
                    leaveType: true
                },
                orderBy: { appliedAt: 'desc' },
                take: 10 // Limit to recent applications
            });
            const formattedApplications = applications.map(app => ({
                id: app.id,
                type: app.leaveType.name,
                startDate: app.startDate.toISOString().split('T')[0],
                endDate: app.endDate.toISOString().split('T')[0],
                days: Number(app.totalDays),
                reason: app.reason,
                status: app.status,
                appliedDate: app.appliedAt.toISOString().split('T')[0],
                approver: app.approvedBy || null,
                approvedAt: app.approvedAt?.toISOString().split('T')[0] || null
            }));
            res.json({ success: true, data: formattedApplications });
        }
        catch (error) {
            console.error('Error fetching leave applications:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch leave applications' });
        }
    }
    // Get leave types
    async getLeaveTypes(req, res) {
        try {
            const leaveTypes = await prisma_1.prisma.leaveType.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            });
            const formattedTypes = leaveTypes.map(type => ({
                id: type.id,
                name: type.name,
                description: type.description,
                maxDaysPerYear: type.maxDaysPerYear,
                carryForward: type.carryForward,
                encashable: type.encashable,
                requiresApproval: type.requiresApproval
            }));
            res.json({ success: true, data: formattedTypes });
        }
        catch (error) {
            console.error('Error fetching leave types:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch leave types' });
        }
    }
    // Create new leave application
    async createLeaveApplication(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'User not authenticated' });
            }
            const { leaveTypeId, startDate, endDate, reason } = req.body;
            if (!leaveTypeId || !startDate || !endDate || !reason) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: leaveTypeId, startDate, endDate, reason'
                });
            }
            const employee = await prisma_1.prisma.employee.findFirst({
                where: { userId }
            });
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }
            // Calculate total days
            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
            // Check if dates are valid
            if (totalDays <= 0) {
                return res.status(400).json({ success: false, error: 'Invalid date range' });
            }
            // Create leave application
            const application = await prisma_1.prisma.leaveApplication.create({
                data: {
                    employeeId: employee.id,
                    leaveTypeId,
                    startDate: start,
                    endDate: end,
                    totalDays: totalDays,
                    reason,
                    status: 'PENDING'
                },
                include: {
                    leaveType: true
                }
            });
            res.status(201).json({
                success: true,
                data: {
                    id: application.id,
                    type: application.leaveType.name,
                    startDate: application.startDate.toISOString().split('T')[0],
                    endDate: application.endDate.toISOString().split('T')[0],
                    days: Number(application.totalDays),
                    reason: application.reason,
                    status: application.status,
                    appliedDate: application.appliedAt.toISOString().split('T')[0]
                }
            });
        }
        catch (error) {
            console.error('Error creating leave application:', error);
            res.status(500).json({ success: false, error: 'Failed to create leave application' });
        }
    }
    // Get upcoming leaves
    async getUpcomingLeaves(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'User not authenticated' });
            }
            const employee = await prisma_1.prisma.employee.findFirst({
                where: { userId }
            });
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }
            const today = new Date();
            const upcomingApplications = await prisma_1.prisma.leaveApplication.findMany({
                where: {
                    employeeId: employee.id,
                    status: 'APPROVED',
                    startDate: { gte: today }
                },
                include: {
                    leaveType: true
                },
                orderBy: { startDate: 'asc' },
                take: 5
            });
            const formattedUpcoming = upcomingApplications.map(app => ({
                id: app.id,
                type: app.leaveType.name,
                startDate: app.startDate.toISOString().split('T')[0],
                endDate: app.endDate.toISOString().split('T')[0],
                days: Number(app.totalDays),
                reason: app.reason
            }));
            res.json({ success: true, data: formattedUpcoming });
        }
        catch (error) {
            console.error('Error fetching upcoming leaves:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch upcoming leaves' });
        }
    }
    // Create compensatory leave request
    async createCompensatoryLeaveRequest(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'User not authenticated' });
            }
            const { workDate, hoursWorked, reason, workDescription, compOffDate } = req.body;
            // Validation
            if (!workDate || !hoursWorked || !reason || !workDescription) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: workDate, hoursWorked, reason, workDescription'
                });
            }
            if (hoursWorked <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Hours worked must be greater than 0'
                });
            }
            const employee = await prisma_1.prisma.employee.findFirst({
                where: { userId }
            });
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }
            // Calculate compensatory days (1 day for every 8 hours)
            const compensatoryDays = Math.ceil(Number(hoursWorked) / 8);
            const compensatoryRequest = await prisma_1.prisma.compensatoryLeaveRequest.create({
                data: {
                    employeeId: employee.id,
                    workDate: new Date(workDate),
                    hoursWorked: Number(hoursWorked),
                    reason: `${reason}\n\nWork Description: ${workDescription}`,
                    compOffDate: compOffDate ? new Date(compOffDate) : null,
                }
            });
            res.json({
                success: true,
                data: {
                    id: compensatoryRequest.id,
                    compensatoryDays,
                    message: `Compensatory leave request created for ${compensatoryDays} day(s)`
                }
            });
        }
        catch (error) {
            console.error('Error creating compensatory leave request:', error);
            res.status(500).json({ success: false, error: 'Failed to create compensatory leave request' });
        }
    }
    // Get compensatory leave requests
    async getCompensatoryLeaveRequests(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ success: false, error: 'User not authenticated' });
            }
            const employee = await prisma_1.prisma.employee.findFirst({
                where: { userId }
            });
            if (!employee) {
                return res.status(404).json({ success: false, error: 'Employee not found' });
            }
            const compensatoryRequests = await prisma_1.prisma.compensatoryLeaveRequest.findMany({
                where: { employeeId: employee.id },
                orderBy: { appliedAt: 'desc' },
                take: 10
            });
            const formattedRequests = compensatoryRequests.map(request => ({
                id: request.id,
                workDate: request.workDate.toISOString().split('T')[0],
                hoursWorked: Number(request.hoursWorked),
                reason: request.reason,
                status: request.status,
                compensatoryDays: Math.ceil(Number(request.hoursWorked) / 8),
                appliedAt: request.appliedAt.toISOString(),
                approvedAt: request.approvedAt ? request.approvedAt.toISOString() : undefined,
                compOffDate: request.compOffDate ? request.compOffDate.toISOString().split('T')[0] : undefined
            }));
            res.json({ success: true, data: formattedRequests });
        }
        catch (error) {
            console.error('Error fetching compensatory leave requests:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch compensatory leave requests' });
        }
    }
}
exports.LeaveController = LeaveController;
//# sourceMappingURL=leaveController.js.map