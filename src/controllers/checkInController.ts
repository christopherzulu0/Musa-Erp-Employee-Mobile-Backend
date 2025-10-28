import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class CheckInController {
  // Create check-in/out record
  async createCheckIn(req: Request, res: Response) {
    try {
      console.log('=== CREATE CHECK-IN START ===');
      const userId = (req as any).userId;
      const { qrCodeId, type, location, latitude, longitude, status } = req.body;
      
      console.log('Check-in request:', { qrCodeId, type, location, latitude, longitude, status });
      console.log('User ID:', userId);

      // Find employee with department
      const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          department: true,
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      // If QR code provided, validate it
      let validatedQrCode = null;
      if (qrCodeId) {
        console.log('Looking for QR code with ID:', qrCodeId);
        
        // First try to find by database ID
        let qrCode = await prisma.qRCode.findUnique({
          where: { id: qrCodeId },
        });
        
        console.log('QR code found by database ID:', qrCode ? 'yes' : 'no');

        // If not found by database ID, try to find by custom ID in qrData
        if (!qrCode) {
          console.log('Not found by database ID, searching by custom ID in qrData');
          const qrCodes = await prisma.qRCode.findMany({
            where: { 
              status: 'ACTIVE',
              qrData: {
                contains: qrCodeId
              }
            }
          });

          // Find the exact match by parsing qrData
          for (const qr of qrCodes) {
            try {
              const qrDataObj = JSON.parse(qr.qrData);
              if (qrDataObj.id === qrCodeId) {
                qrCode = qr;
                break;
              }
            } catch (e) {
              console.log('Error parsing qrData:', e);
            }
          }
        }

        console.log('QR code found:', qrCode ? 'yes' : 'no');

        if (!qrCode) {
          return res.status(404).json({
            success: false,
            error: 'QR code not found',
          });
        }
        
        validatedQrCode = qrCode;

        if (qrCode.status !== 'ACTIVE') {
          return res.status(400).json({
            success: false,
            error: 'QR code is not active',
          });
        }

        if (qrCode.expiryDate && new Date() > qrCode.expiryDate) {
          return res.status(400).json({
            success: false,
            error: 'QR code has expired',
          });
        }
      }

      // Check for existing check-in if this is a check-out
      if (type === 'CHECK_OUT') {
        console.log('Checking for existing check-in for employee:', employee.id);
        const lastCheckIn = await prisma.checkInOut.findFirst({
          where: {
            employeeId: employee.id,
            type: 'CHECK_IN',
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
            }
          },
          orderBy: { timestamp: 'desc' }
        });

        console.log('Last check-in found:', lastCheckIn ? 'yes' : 'no');

        if (!lastCheckIn) {
          return res.status(400).json({
            success: false,
            error: 'No check-in found for today. Please check in first.',
          });
        }
      }

      // Create check-in/out record
      console.log('Creating check-in record with data:', {
        employeeId: employee.id,
        qrCodeId: validatedQrCode?.id || null,
        type: type.toUpperCase(),
        location: location || validatedQrCode?.location || employee.department.name,
        method: qrCodeId ? 'QR_CODE' : 'MANUAL'
      });

      const checkIn = await prisma.checkInOut.create({
        data: {
          employeeId: employee.id,
          qrCodeId: validatedQrCode?.id || null, // Use the database ID of the QR code
          timestamp: new Date(),
          type: (type || 'CHECK_IN').toUpperCase(),
          location: location || validatedQrCode?.location || employee.department.name,
          latitude: latitude ? parseFloat(latitude.toString()) : null,
          longitude: longitude ? parseFloat(longitude.toString()) : null,
          method: qrCodeId ? 'QR_CODE' : 'MANUAL',
        },
        include: {
          qrCode: true,
        },
      });

      console.log('Check-in created successfully:', checkIn.id);

      // Update attendance record if needed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attendanceRecord = await prisma.attendanceRecord.findUnique({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: today
          }
        }
      });

      if (!attendanceRecord) {
        await prisma.attendanceRecord.create({
          data: {
            employeeId: employee.id,
            date: today,
            status: status || 'PRESENT',
            checkIn: type === 'CHECK_IN' ? new Date() : undefined,
            checkOut: type === 'CHECK_OUT' ? new Date() : undefined
          }
        });
        console.log('Created new attendance record with status:', status || 'PRESENT');
      } else {
        // Update attendance record with new check-in/check-out time
        const updateData: any = {
          checkIn: type === 'CHECK_IN' ? new Date() : attendanceRecord.checkIn,
          checkOut: type === 'CHECK_OUT' ? new Date() : attendanceRecord.checkOut
        };
        
        // If status is ABSENT and user is checking in, change to PRESENT or LATE
        // This handles the automatic absent creation at midnight
        if (attendanceRecord.status === 'ABSENT' && type === 'CHECK_IN') {
          updateData.status = status || 'PRESENT';
          console.log('Changing attendance status from ABSENT to:', status || 'PRESENT');
        } else if (status && status !== attendanceRecord.status) {
          // Otherwise, only update status if it's being set and is different
          updateData.status = status;
          console.log('Updating attendance status from', attendanceRecord.status, 'to', status);
        }
        
        await prisma.attendanceRecord.update({
          where: {
            employeeId_date: {
              employeeId: employee.id,
              date: today
            }
          },
          data: updateData
        });
        console.log('Updated existing attendance record');
      }
      
      res.json({
        success: true,
        message: `${type === 'CHECK_OUT' ? 'Checked out' : 'Checked in'} successfully`,
        data: checkIn,
      });
    } catch (error) {
      console.error('Check-in error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({
        success: false,
        error: 'Failed to record check-in/out',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get check-in/out history
  async getCheckIns(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          department: true,
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      const checkIns = await prisma.checkInOut.findMany({
        where: { employeeId: employee.id },
        orderBy: { timestamp: 'desc' },
        take: 50,
        include: {
          qrCode: true,
        },
      });

      res.json({
        success: true,
        data: checkIns,
      });
    } catch (error) {
      console.error('Get check-ins error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch check-ins',
      });
    }
  }

  // Get today's check-in/out
  async getTodayCheckIn(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          department: true,
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCheckIns = await prisma.checkInOut.findMany({
        where: {
          employeeId: employee.id,
          timestamp: {
            gte: today,
            lt: tomorrow,
          },
        },
        orderBy: { timestamp: 'asc' },
        include: {
          qrCode: true,
        },
      });

      res.json({
        success: true,
        data: todayCheckIns,
      });
    } catch (error) {
      console.error('Get today check-in error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch today\'s check-ins',
      });
    }
  }

  // Get this month's attendance stats
  async getMonthlyStats(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          department: true,
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      // Get first and last day of current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get all attendance records for this month
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: firstDay,
            lte: lastDay,
          },
        },
      });

      // Calculate stats
      const totalDays = lastDay.getDate(); // Total days in current month
      const presentDays = attendanceRecords.filter((record: any) => record.status === 'PRESENT').length;
      const absentDays = attendanceRecords.filter((record: any) => record.status === 'ABSENT').length;
      const lateDays = attendanceRecords.filter((record: any) => record.status === 'LATE').length;

      res.json({
        success: true,
        data: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
        },
      });
    } catch (error) {
      console.error('Get monthly stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch monthly stats',
      });
    }
  }

  // Submit attendance request/correction
  async submitAttendanceRequest(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { date, checkIn, checkOut, status, notes } = req.body;

      const employee = await prisma.employee.findUnique({
        where: { userId },
        include: {
          department: true,
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      // Parse the date
      const requestDate = new Date(date);
      requestDate.setHours(0, 0, 0, 0);

      // Parse check-in and check-out times if provided
      let parsedCheckIn: Date | undefined;
      let parsedCheckOut: Date | undefined;

      if (checkIn && checkIn.trim() !== '') {
        const checkInDate = new Date(`${date}T${checkIn}`);
        if (!isNaN(checkInDate.getTime())) {
          parsedCheckIn = checkInDate;
        }
      }

      if (checkOut && checkOut.trim() !== '') {
        const checkOutDate = new Date(`${date}T${checkOut}`);
        if (!isNaN(checkOutDate.getTime())) {
          parsedCheckOut = checkOutDate;
        }
      }

      // Find or create attendance record
      const attendanceRecord = await prisma.attendanceRecord.findUnique({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: requestDate
          }
        }
      });

      if (attendanceRecord) {
        // Update existing record
        const updateData: any = {};
        
        if (status) updateData.status = status;
        if (parsedCheckIn !== undefined) updateData.checkIn = parsedCheckIn;
        if (parsedCheckOut !== undefined) updateData.checkOut = parsedCheckOut;
        if (notes !== undefined && notes !== null) updateData.notes = notes;

        await prisma.attendanceRecord.update({
          where: {
            employeeId_date: {
              employeeId: employee.id,
              date: requestDate
            }
          },
          data: updateData
        });

        return res.json({
          success: true,
          message: 'Attendance record updated successfully',
        });
      } else {
        // Create new record
        const createData: any = {
          employeeId: employee.id,
          date: requestDate,
          status: status || 'PRESENT',
        };

        if (parsedCheckIn !== undefined) createData.checkIn = parsedCheckIn;
        if (parsedCheckOut !== undefined) createData.checkOut = parsedCheckOut;
        if (notes !== undefined && notes !== null && notes.trim() !== '') createData.notes = notes;

        await prisma.attendanceRecord.create({
          data: createData
        });

        return res.json({
          success: true,
          message: 'Attendance record created successfully',
        });
      }
    } catch (error) {
      console.error('Attendance request error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process attendance request',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get attendance records for the current user
  async getAttendanceRecords(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      // Get attendance records for this month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: firstDay,
            lte: lastDay,
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 10,
      });

      return res.json({
        success: true,
        data: attendanceRecords,
      });
    } catch (error) {
      console.error('Get attendance records error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch attendance records',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
