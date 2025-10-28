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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("../lib/prisma");
// Load environment variables
dotenv_1.default.config({ path: '.env' });
class AuthController {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    }
    // Register new user
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, position, departmentId } = req.body;
            // Check if user already exists
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'User with this email already exists'
                });
            }
            // Verify department exists
            const department = await prisma_1.prisma.department.findUnique({
                where: { id: departmentId }
            });
            if (!department) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid department'
                });
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            // Create user and employee in a transaction
            const result = await prisma_1.prisma.$transaction(async (tx) => {
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
            const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
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
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create user'
            });
        }
    }
    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Find user with employee data
            const user = await prisma_1.prisma.user.findUnique({
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
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
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
            const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
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
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed'
            });
        }
    }
    // Logout user (optional - mainly for token blacklisting)
    async logout(req, res) {
        try {
            // In a real app, you might want to blacklist the token
            // For now, we'll just return success since JWT tokens are stateless
            console.log('User logout requested');
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
    }
    // Get current user profile
    async getProfile(req, res) {
        try {
            const userId = req.userId; // Set by auth middleware
            const user = await prisma_1.prisma.user.findUnique({
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
                        },
                        select: {
                            id: true,
                            employeeId: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            location: true,
                            position: true,
                            departmentId: true,
                            hireDate: true,
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
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get profile'
            });
        }
    }
    // Generate unique employee ID
    generateEmployeeId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `EMP${timestamp}${random}`;
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map