const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const transactionRoutes = require('./transaction.routes');
const loanRoutes = require('./loan.routes');
const notificationRoutes = require('./notification.routes');
const razorpayRoutes = require('./razorpay.routes');

router.use('/', authRoutes);
router.use('/', userRoutes);        // Consistently consolidated mount point (Item 13): handles /balance and /allusers
router.use('/transaction', transactionRoutes); // Renamed from /trasiction to /transaction (Item 11)
router.use('/loans', loanRoutes);
router.use('/notifications', notificationRoutes);
router.use('/razorpay', razorpayRoutes);  // Real payment gateway

module.exports = router;
