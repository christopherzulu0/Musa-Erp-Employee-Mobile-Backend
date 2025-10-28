"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateSignup = void 0;
// Validation middleware for signup
const validateSignup = (req, res, next) => {
    const { email, password, firstName, lastName, position, departmentId } = req.body;
    const errors = [];
    // Required fields
    if (!email)
        errors.push('Email is required');
    if (!password)
        errors.push('Password is required');
    if (!firstName)
        errors.push('First name is required');
    if (!lastName)
        errors.push('Last name is required');
    if (!position)
        errors.push('Position is required');
    if (!departmentId)
        errors.push('Department is required');
    // Email validation
    if (email && !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    // Password validation
    if (password && password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    next();
};
exports.validateSignup = validateSignup;
// Validation middleware for login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email)
        errors.push('Email is required');
    if (!password)
        errors.push('Password is required');
    if (email && !isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    next();
};
exports.validateLogin = validateLogin;
// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
//# sourceMappingURL=validation.js.map