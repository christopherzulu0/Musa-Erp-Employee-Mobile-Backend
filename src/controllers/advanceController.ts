import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AdvanceController {
  // Create advance request
  async createAdvanceRequest(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      const { amount, purpose, installmentCount, interestRate } = req.body;

      // Validate required fields
      if (!amount || !purpose || !installmentCount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: amount, purpose, and installmentCount' 
        });
      }

      // Get employee
      const employee = await prisma.employee.findFirst({
        where: { userId }
      });

      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      // Generate unique advance ID
      const advanceId = `ADV${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Calculate values
      const amountDecimal = parseFloat(amount);
      const installmentCountInt = parseInt(installmentCount);
      const interestRateDecimal = interestRate ? parseFloat(interestRate) : 0;
      
      // Calculate total amount with interest if applicable
      const totalAmount = amountDecimal + (amountDecimal * interestRateDecimal / 100);
      const installmentAmount = totalAmount / installmentCountInt;

      // Create advance request
      const advanceRequest = await prisma.employeeAdvance.create({
        data: {
          employeeId: employee.id,
          advanceId,
          amount: totalAmount,
          purpose,
          totalInstallments: installmentCountInt,
          paidInstallments: 0,
          remainingAmount: totalAmount,
          interestRate: interestRateDecimal,
          status: 'PENDING',
          repaymentStatus: 'NOT_STARTED',
        }
      });

      res.status(201).json({
        success: true,
        data: advanceRequest
      });

    } catch (error) {
      console.error('Error creating advance request:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create advance request' 
      });
    }
  }

  // Get advance requests for current user
  async getAdvanceRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      // Get employee
      const employee = await prisma.employee.findFirst({
        where: { userId }
      });

      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      // Get advance requests
      const advanceRequests = await prisma.employeeAdvance.findMany({
        where: {
          employeeId: employee.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: advanceRequests
      });

    } catch (error) {
      console.error('Error fetching advance requests:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch advance requests' 
      });
    }
  }

  // Get single advance request by ID
  async getAdvanceRequestById(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'User not authenticated' });
      }

      // Get employee
      const employee = await prisma.employee.findFirst({
        where: { userId }
      });

      if (!employee) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      // Get advance request
      const advanceRequest = await prisma.employeeAdvance.findFirst({
        where: {
          id,
          employeeId: employee.id
        },
        include: {
          repayments: {
            orderBy: {
              installmentNumber: 'asc'
            }
          }
        }
      });

      if (!advanceRequest) {
        return res.status(404).json({ success: false, error: 'Advance request not found' });
      }

      res.json({
        success: true,
        data: advanceRequest
      });

    } catch (error) {
      console.error('Error fetching advance request:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch advance request' 
      });
    }
  }
}
