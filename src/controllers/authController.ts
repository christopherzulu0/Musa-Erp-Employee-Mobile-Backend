import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Load environment variables
dotenv.config({ path: '.env' });

export class AuthController {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  }

  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, position, departmentId } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Verify department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          error: 'Invalid department'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user and employee in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            role: 'EMPLOYEE'
          }
        });

        // Generate employee ID
        const employeeId = this.generateEmployeeId();

        // Create employee
        const employee = await tx.employee.create({
          data: {
            userId: user.id,
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            position,
            departmentId,
            hireDate: new Date()
          },
          include: {
            department: true,
            manager: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });

        return { user, employee };
      });

      // Generate JWT token
      const payload = { 
        userId: result.user.id, 
        email: result.user.email,
        role: result.user.role 
      };
      const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = result.user;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: userWithoutPassword,
          employee: result.employee,
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user with employee data
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          employee: {
            include: {
              department: true,
              manager: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const payload = { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      };
      const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  // Logout user (optional - mainly for token blacklisting)
  async logout(req: Request, res: Response) {
    try {
      // In a real app, you might want to blacklist the token
      // For now, we'll just return success since JWT tokens are stateless
      console.log('User logout requested');
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId; // Set by auth middleware

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employee: {
            include: {
              department: true,
              manager: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  // Generate unique employee ID
  private generateEmployeeId(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `EMP${timestamp}${random}`;
  }
}
