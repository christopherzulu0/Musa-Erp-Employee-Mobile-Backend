"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceCronService = void 0;
const cron = __importStar(require("node-cron"));
const prisma_1 = require("../lib/prisma");
class AttendanceCronService {
    constructor() {
        // Create the task but don't start it immediately
        this.task = cron.schedule('0 0 * * *', async () => {
            console.log('Running midnight attendance check...');
            await this.markAbsentForToday();
        }, {
            timezone: "Africa/Lusaka"
        });
        // Stop the task immediately after creation since we'll start it manually
        this.task.stop();
    }
    start() {
        this.task.start();
        console.log('Attendance cron job started - will mark employees as ABSENT at midnight');
    }
    stop() {
        this.task.stop();
        console.log('Attendance cron job stopped');
    }
    async markAbsentForToday() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Get all active employees
            const activeEmployees = await prisma_1.prisma.employee.findMany({
                where: {
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    employeeId: true,
                }
            });
            console.log(`Found ${activeEmployees.length} active employees`);
            let createdCount = 0;
            let skippedCount = 0;
            for (const employee of activeEmployees) {
                try {
                    // Check if attendance record already exists for today
                    const existingRecord = await prisma_1.prisma.attendanceRecord.findUnique({
                        where: {
                            employeeId_date: {
                                employeeId: employee.id,
                                date: today
                            }
                        }
                    });
                    // If no record exists, create an ABSENT record
                    if (!existingRecord) {
                        await prisma_1.prisma.attendanceRecord.create({
                            data: {
                                employeeId: employee.id,
                                date: today,
                                status: 'ABSENT',
                            }
                        });
                        createdCount++;
                        console.log(`Created ABSENT record for employee ${employee.employeeId}`);
                    }
                    else {
                        skippedCount++;
                        console.log(`Attendance record already exists for employee ${employee.employeeId}`);
                    }
                }
                catch (error) {
                    console.error(`Error creating attendance record for employee ${employee.employeeId}:`, error);
                }
            }
            console.log(`Midnight attendance check completed. Created: ${createdCount}, Skipped: ${skippedCount}`);
        }
        catch (error) {
            console.error('Error in markAbsentForToday:', error);
        }
    }
    // Public method to manually trigger the job (useful for testing)
    async runNow() {
        console.log('Manually triggering attendance check...');
        await this.markAbsentForToday();
    }
}
exports.AttendanceCronService = AttendanceCronService;
//# sourceMappingURL=attendanceCronService.js.map