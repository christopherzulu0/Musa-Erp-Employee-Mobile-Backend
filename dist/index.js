"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST
dotenv_1.default.config({ path: '.env' });
// Set DATABASE_URL explicitly if not loaded
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:87064465@localhost:5432/hr?schema=public';
}
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const prisma_1 = require("./lib/prisma");
const attendanceCronService_1 = require("./services/attendanceCronService");
// Import routes
const advance_1 = __importDefault(require("./routes/advance"));
const auth_1 = __importDefault(require("./routes/auth"));
const checkin_1 = __importDefault(require("./routes/checkin"));
const departments_1 = __importDefault(require("./routes/departments"));
const leave_1 = __importDefault(require("./routes/leave"));
const performance_1 = __importDefault(require("./routes/performance"));
const profile_1 = __importDefault(require("./routes/profile"));
const shift_1 = __importDefault(require("./routes/shift"));
// Create Express app
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Validate PORT is a valid number
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    console.error('Invalid PORT value:', process.env.PORT);
    process.exit(1);
}
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:8081', // React Native default
        'http://10.77.233.212:8081', // Network IP for React Native
        'exp://10.77.233.212:8081', // Expo development server
        'http://10.77.233.212:3000', // Backend itself
    ],
    credentials: true
}));
app.use((0, morgan_1.default)('combined')); // Logging
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/advance', advance_1.default);
app.use('/api/departments', departments_1.default);
app.use('/api/checkin', checkin_1.default);
app.use('/api/leave', leave_1.default);
app.use('/api/performance', performance_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/shift', shift_1.default);
// Debug all requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Initialize attendance cron service
const attendanceCronService = new attendanceCronService_1.AttendanceCronService();
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    attendanceCronService.stop();
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    attendanceCronService.stop();
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Health check: http://10.77.233.212:${PORT}/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🔐 Auth API: http://10.77.233.212:${PORT}/api/auth`);
    // Start the attendance cron service
    attendanceCronService.start();
});
exports.default = app;
//# sourceMappingURL=index.js.map