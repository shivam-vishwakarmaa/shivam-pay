const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const transactionRoutes = require('./transaction.routes');

router.use('/', authRoutes);
router.use('/all', userRoutes); // this handles /all/allusers
router.use('/', userRoutes); // this handles /balance
router.use('/trasiction', transactionRoutes);

module.exports = router;
