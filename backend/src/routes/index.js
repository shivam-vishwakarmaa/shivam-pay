const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const transactionRoutes = require('./transaction.routes');
const loanRoutes = require('./loan.routes');
const notificationRoutes = require('./notification.routes');
const razorpayRoutes = require('./razorpay.routes');

router.use('/', authRoutes);
router.use('/all', userRoutes);    // handles /all/allusers
router.use('/', userRoutes);       // handles /balance and /update-profile
router.use('/trasiction', transactionRoutes);
router.use('/loans', loanRoutes);
router.use('/notifications', notificationRoutes);
router.use('/razorpay', razorpayRoutes);  // Real payment gateway

module.exports = router;
