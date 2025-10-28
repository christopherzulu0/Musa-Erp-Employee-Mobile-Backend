import * as cron from 'node-cron';
import { prisma } from '../lib/prisma';

export class AttendanceCronService {
  // Run the job at midnight every day (00:00)
  private task: cron.ScheduledTask;

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

  public start() {
    this.task.start();
    console.log('Attendance cron job started - will mark employees as ABSENT at midnight');
  }

  public stop() {
    this.task.stop();
    console.log('Attendance cron job stopped');
  }

  private async markAbsentForToday() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all active employees
      const activeEmployees = await prisma.employee.findMany({
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
          const existingRecord = await prisma.attendanceRecord.findUnique({
            where: {
              employeeId_date: {
                employeeId: employee.id,
                date: today
              }
            }
          });

          // If no record exists, create an ABSENT record
          if (!existingRecord) {
            await prisma.attendanceRecord.create({
              data: {
                employeeId: employee.id,
                date: today,
                status: 'ABSENT',
              }
            });
            createdCount++;
            console.log(`Created ABSENT record for employee ${employee.employeeId}`);
          } else {
            skippedCount++;
            console.log(`Attendance record already exists for employee ${employee.employeeId}`);
          }
        } catch (error) {
          console.error(`Error creating attendance record for employee ${employee.employeeId}:`, error);
        }
      }

      console.log(`Midnight attendance check completed. Created: ${createdCount}, Skipped: ${skippedCount}`);
    } catch (error) {
      console.error('Error in markAbsentForToday:', error);
    }
  }

  // Public method to manually trigger the job (useful for testing)
  public async runNow() {
    console.log('Manually triggering attendance check...');
    await this.markAbsentForToday();
  }
}
