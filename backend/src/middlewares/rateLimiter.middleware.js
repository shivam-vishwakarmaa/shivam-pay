const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (login, registration, Google SSO)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 login/register requests per window
    message: {
        success: false,
        message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for payment and transaction endpoints
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 payment requests per window
    message: {
        success: false,
        message: "Too many transaction attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for PIN verification attempts (prevents brute force of 4-digit PINs)
const pinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Max 15 PIN authorization attempts per 15 mins
    message: {
        success: false,
        message: "Too many incorrect PIN attempts. Security lockout active for 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, paymentLimiter, pinLimiter };
