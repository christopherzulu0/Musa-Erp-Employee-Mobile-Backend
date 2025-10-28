"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceController = exports.PerformanceController = void 0;
const prisma_1 = require("../lib/prisma");
class PerformanceController {
    // Get performance metrics for an employee
    async getPerformanceMetrics(req, res) {
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
            // Get overall rating from latest performance review
            const latestReview = await prisma_1.prisma.performanceReview.findFirst({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' }
            });
            // Get goals completion count from performance reviews
            const performanceReviews = await prisma_1.prisma.performanceReview.findMany({
                where: { employeeId: employee.id }
            });
            let totalGoals = 0;
            let completedGoals = 0;
            for (const review of performanceReviews) {
                if (review.goals) {
                    try {
                        const goalsData = JSON.parse(review.goals);
                        if (Array.isArray(goalsData)) {
                            totalGoals += goalsData.length;
                            completedGoals += goalsData.filter(goal => (goal.progress || 0) >= 100).length;
                        }
                        else if (typeof goalsData === 'object') {
                            totalGoals += 1;
                            if ((goalsData.progress || 0) >= 100) {
                                completedGoals += 1;
                            }
                        }
                    }
                    catch (parseError) {
                        // If JSON parsing fails, count as one goal
                        totalGoals += 1;
                        if (review.status === 'COMPLETED') {
                            completedGoals += 1;
                        }
                    }
                }
            }
            // Get total energy points
            const energyPointsResult = await prisma_1.prisma.energyPoint.aggregate({
                where: { employeeId: employee.id },
                _sum: { points: true }
            });
            // Get team rating (average of peer reviews)
            const teamReviews = await prisma_1.prisma.performanceReview.findMany({
                where: {
                    employeeId: employee.id,
                    status: 'COMPLETED'
                },
                select: { overallScore: true }
            });
            const teamRating = teamReviews.length > 0
                ? teamReviews.reduce((sum, review) => sum + Number(review.overallScore || 0), 0) / teamReviews.length
                : 0;
            const metrics = {
                overallRating: latestReview ? Number(latestReview.overallScore || 0) : 0,
                goalsCompleted: `${completedGoals}/${totalGoals}`,
                energyPoints: energyPointsResult._sum.points || 0,
                teamRating: teamRating.toFixed(1)
            };
            res.json({ success: true, data: metrics });
        }
        catch (error) {
            console.error('Error fetching performance metrics:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch performance metrics' });
        }
    }
    // Get employee goals from performance reviews
    async getGoals(req, res) {
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
            const performanceReviews = await prisma_1.prisma.performanceReview.findMany({
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            const formattedGoals = [];
            for (const review of performanceReviews) {
                if (review.goals) {
                    try {
                        // Parse the goals JSON string
                        const goalsData = JSON.parse(review.goals);
                        // Handle different goal formats
                        if (Array.isArray(goalsData)) {
                            goalsData.forEach((goal, index) => {
                                formattedGoals.push({
                                    id: `${review.id}-${index}`,
                                    title: goal.title || goal.name || `Goal ${index + 1}`,
                                    description: goal.description || goal.details || '',
                                    progress: goal.progress || goal.completion || 0,
                                    target: goal.target || goal.objective || 'Complete goal',
                                    deadline: goal.deadline || goal.dueDate || review.endDate.toISOString().split('T')[0],
                                    status: goal.status || (goal.progress >= 100 ? 'Completed' : goal.progress >= 75 ? 'On Track' : goal.progress >= 50 ? 'At Risk' : 'Overdue')
                                });
                            });
                        }
                        else if (typeof goalsData === 'object') {
                            // Handle single goal object
                            formattedGoals.push({
                                id: review.id,
                                title: goalsData.title || goalsData.name || 'Performance Goal',
                                description: goalsData.description || goalsData.details || '',
                                progress: goalsData.progress || goalsData.completion || 0,
                                target: goalsData.target || goalsData.objective || 'Complete goal',
                                deadline: goalsData.deadline || goalsData.dueDate || review.endDate.toISOString().split('T')[0],
                                status: goalsData.status || (goalsData.progress >= 100 ? 'Completed' : goalsData.progress >= 75 ? 'On Track' : goalsData.progress >= 50 ? 'At Risk' : 'Overdue')
                            });
                        }
                    }
                    catch (parseError) {
                        console.error('Error parsing goals JSON:', parseError);
                        // If JSON parsing fails, treat as plain text
                        formattedGoals.push({
                            id: review.id,
                            title: `Review Goals - ${review.reviewPeriod}`,
                            description: review.goals,
                            progress: review.status === 'COMPLETED' ? 100 : 50,
                            target: 'Complete review goals',
                            deadline: review.endDate.toISOString().split('T')[0],
                            status: review.status === 'COMPLETED' ? 'Completed' : 'In Progress'
                        });
                    }
                }
            }
            // If no goals found in reviews, create some sample goals based on review data
            if (formattedGoals.length === 0 && performanceReviews.length > 0) {
                const latestReview = performanceReviews[0];
                formattedGoals.push({
                    id: latestReview.id,
                    title: `Performance Goals - ${latestReview.reviewPeriod}`,
                    description: 'Complete performance objectives for the review period',
                    progress: latestReview.status === 'COMPLETED' ? 100 : 50,
                    target: 'Meet performance expectations',
                    deadline: latestReview.endDate.toISOString().split('T')[0],
                    status: latestReview.status === 'COMPLETED' ? 'Completed' : 'In Progress'
                });
            }
            res.json({ success: true, data: formattedGoals });
        }
        catch (error) {
            console.error('Error fetching goals:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch goals' });
        }
    }
    // Get energy points
    async getEnergyPoints(req, res) {
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
            const energyPoints = await prisma_1.prisma.energyPoint.findMany({
                where: { employeeId: employee.id },
                orderBy: { awardedAt: 'desc' },
                take: 10
            });
            // Get employee information for awardedBy fields
            const awardedByIds = energyPoints
                .map(point => point.awardedBy)
                .filter((id) => id !== null);
            const awardedByEmployees = await prisma_1.prisma.employee.findMany({
                where: {
                    userId: { in: awardedByIds }
                },
                select: {
                    id: true,
                    userId: true,
                    firstName: true,
                    lastName: true
                }
            });
            // Create a map for quick lookup
            const employeeMap = new Map(awardedByEmployees.map(emp => [emp.userId, `${emp.firstName} ${emp.lastName}`]));
            const formattedEnergyPoints = energyPoints.map(point => ({
                id: point.id,
                points: point.points,
                reason: point.reason,
                awardedBy: point.awardedBy ? employeeMap.get(point.awardedBy) || 'Unknown' : 'System',
                date: point.awardedAt.toISOString().split('T')[0]
            }));
            res.json({ success: true, data: formattedEnergyPoints });
        }
        catch (error) {
            console.error('Error fetching energy points:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch energy points' });
        }
    }
    // Get performance reviews
    async getPerformanceReviews(req, res) {
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
            const reviews = await prisma_1.prisma.performanceReview.findMany({
                where: { employeeId: employee.id },
                include: {
                    reviewer: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            const formattedReviews = reviews.map(review => ({
                id: review.id,
                period: review.reviewPeriod,
                overallScore: review.overallScore ? Number(review.overallScore) : 0,
                status: review.status,
                reviewer: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
                dueDate: review.endDate.toISOString().split('T')[0]
            }));
            res.json({ success: true, data: formattedReviews });
        }
        catch (error) {
            console.error('Error fetching performance reviews:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch performance reviews' });
        }
    }
}
exports.PerformanceController = PerformanceController;
exports.performanceController = new PerformanceController();
//# sourceMappingURL=performanceController.js.map