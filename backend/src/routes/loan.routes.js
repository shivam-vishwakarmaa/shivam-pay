const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authMiddleware = require('../middlewares/auth.middleware');
const { pinLimiter } = require('../middlewares/rateLimiter.middleware');
const User = require('../models/User.model');
const Loan = require('../models/Loan.model');
const Transaction = require('../models/Transaction.model');
const Notification = require('../models/Notification.model');
const { runEmiDeductionEngine } = require('../cron/emiCron');
const { getCreditLimit } = require('../utils/creditLimit');

// Get all loans involving current user (as lender or borrower)
router.get('/my-loans', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const loans = await Loan.find({
            $or: [{ lenderId: userId }, { borrowerId: userId }]
        }).sort({ createdAt: -1 });
        res.json({ success: true, loans, userId });
    } catch (err) {
        console.error("Fetch loans error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve loan portfolio." });
    }
});

// Propose / Request a Loan
router.post('/propose', authMiddleware, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const { partnerUsername, role, principalAmount, interestRate, durationMonths, deductionDayOfMonth, remarks } = req.body;

        if (!partnerUsername || principalAmount <= 0 || durationMonths <= 0 || interestRate < 0) {
            return res.status(400).json({ success: false, message: 'Invalid financial parameters provided.' });
        }

        const currentUser = await User.findById(currentUserId);
        const partnerUser = await User.findOne({ 
            $or: [{ username: partnerUsername.toLowerCase().trim() }, { email: partnerUsername.toLowerCase().trim() }]
        });

        if (!partnerUser) {
            return res.status(404).json({ success: false, message: `User "${partnerUsername}" not found on ShivamPay.` });
        }

        if (partnerUser._id.toString() === currentUserId) {
            return res.status(400).json({ success: false, message: 'You cannot initiate a loan with yourself.' });
        }

        let lender, borrower;
        if (role === 'LENDER') {
            lender = currentUser;
            borrower = partnerUser;
        } else {
            lender = partnerUser;
            borrower = currentUser;
        }

        const principal = Number(principalAmount);
        const rate = Number(interestRate);
        const months = Number(durationMonths);
        
        const interestAmount = (principal * rate) / 100;
        const totalPayable = Number((principal + interestAmount).toFixed(2));
        const emiAmount = Number((totalPayable / months).toFixed(2));

        // Trust System: Prior transaction check
        const priorTransaction = await Transaction.findOne({
            $or: [
                { senderId: currentUser._id, receiverId: partnerUser._id },
                { senderId: partnerUser._id, receiverId: currentUser._id }
            ]
        });

        if (!priorTransaction) {
            return res.status(400).json({ success: false, message: "A loan can only be proposed between users who have transacted before. Please send a small payment first to establish a connection." });
        }

        // Trust System: Credit limit check
        const limit = getCreditLimit(borrower.trustScore || 50);
        const borrowerActiveLoans = await Loan.find({ borrowerId: borrower._id, status: { $in: ['ACTIVE', 'OVERDUE'] } });
        const currentExposure = borrowerActiveLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

        if (currentExposure + totalPayable > limit) {
            return res.status(400).json({ success: false, message: `Loan rejected: this would exceed the borrower's total credit limit of ₹${limit}. Current active exposure: ₹${currentExposure}.` });
        }
        
        const now = new Date();
        const dueDay = deductionDayOfMonth || 5;
        const nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);

        const loan = await Loan.create({
            lenderId: lender._id,
            lenderName: lender.name || lender.username,
            borrowerId: borrower._id,
            borrowerName: borrower.name || borrower.username,
            principalAmount: principal,
            interestRate: rate,
            durationMonths: months,
            totalPayableAmount: totalPayable,
            emiAmount: emiAmount,
            remainingInstallments: months,
            remainingAmount: totalPayable,
            deductionDayOfMonth: dueDay,
            nextDueDate: nextDueDate,
            status: 'PENDING',
            remarks: remarks || `${role === 'LENDER' ? 'Loan Offer' : 'Loan Request'} via ShivamPay`
        });

        await Notification.create({
            userId: partnerUser._id,
            title: role === 'LENDER' ? "🤝 Loan Offer Received" : "🙏 Loan Request Received",
            message: `${currentUser.name} has proposed a loan of ₹${principal} at ${rate}% interest over ${months} months (EMI: ₹${emiAmount}/mo).`,
            type: "LOAN_REQUEST"
        });

        res.status(201).json({ success: true, message: 'Loan proposal submitted successfully', loan });
    } catch (err) {
        console.error("Loan proposal error:", err);
        res.status(500).json({ success: false, message: "Could not create loan proposal due to server error." });
    }
});

// Accept & Disburse Loan (Atomic Transfer with pinLimiter)
router.post('/accept/:id', authMiddleware, pinLimiter, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;
        
        if (!pin) {
            return res.status(400).json({ success: false, message: "Security PIN is required to authorize loan disbursement." });
        }

        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ success: false, message: 'Loan proposal not found' });
        if (loan.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Loan proposal has already been processed' });

        if (loan.lenderId.toString() !== userId && loan.borrowerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to accept or disburse this loan." });
        }

        const currentUser = await User.findById(userId);
        let isMatch = false;
        if (currentUser.upiPin && currentUser.upiPin.startsWith("$2b$")) {
            isMatch = await bcrypt.compare(pin, currentUser.upiPin);
        } else {
            isMatch = (currentUser.upiPin === pin);
        }
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect security PIN entered. Operation aborted.' });
        }

        const lender = await User.findById(loan.lenderId);
        const borrower = await User.findById(loan.borrowerId);

        // Trust System: Re-evaluate credit limit at time of acceptance
        const limit = getCreditLimit(borrower.trustScore || 50);
        const borrowerActiveLoans = await Loan.find({ borrowerId: borrower._id, status: { $in: ['ACTIVE', 'OVERDUE'] } });
        const currentExposure = borrowerActiveLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

        if (currentExposure + loan.totalPayableAmount > limit) {
            return res.status(400).json({ success: false, message: `Loan acceptance failed: this exceeds the borrower's total credit limit of ₹${limit}. Current active exposure: ₹${currentExposure}.` });
        }

        if (lender.bankbalance < loan.principalAmount) {
            return res.status(400).json({ success: false, message: `Lender (${lender.name}) has insufficient funds in wallet to disburse this loan.` });
        }

        const updatedLender = await User.findOneAndUpdate(
            { _id: loan.lenderId, bankbalance: { $gte: loan.principalAmount } },
            { $inc: { bankbalance: -loan.principalAmount } },
            { new: true }
        );

        if (!updatedLender) {
            return res.status(400).json({ success: false, message: "Lender funds insufficient at exact disbursement execution time." });
        }

        await User.findByIdAndUpdate(loan.borrowerId, { $inc: { bankbalance: loan.principalAmount } });

        loan.status = 'ACTIVE';
        await loan.save();

        const refId = `LOAN-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        await Transaction.create({
            senderId: lender._id,
            senderName: lender.name || lender.username,
            senderUpiId: lender.username,
            receiverId: borrower._id,
            receiverName: borrower.name || borrower.username,
            receiverUpiId: borrower.username,
            amount: loan.principalAmount,
            type: 'LOAN_DISBURSEMENT',
            category: 'Loan Disbursement',
            description: `Principal disbursement for Loan #${loan._id.toString().slice(-6)}`,
            status: 'SUCCESS',
            referenceId: refId
        });

        await Notification.create({
            userId: borrower._id,
            title: "💰 Loan Disbursed Successfully!",
            message: `₹${loan.principalAmount} has been credited to your ShivamPay account from ${lender.name}. Your monthly automated EMI is ₹${loan.emiAmount}.`,
            type: "LOAN_DISBURSEMENT"
        });

        await Notification.create({
            userId: lender._id,
            title: "🤝 Loan Activated",
            message: `You have disbursed ₹${loan.principalAmount} to ${borrower.name}. Monthly automated EMI of ₹${loan.emiAmount} scheduled for day ${loan.deductionDayOfMonth} of every month.`,
            type: "LOAN_DISBURSEMENT"
        });

        res.json({ success: true, message: 'Loan activated and funds disbursed atomically!', loan });
    } catch (err) {
        console.error("Loan accept error:", err);
        res.status(500).json({ success: false, message: "Loan processing failed due to internal server error." });
    }
});

// Reject Loan Proposal
router.post('/reject/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        
        if (loan.lenderId.toString() !== userId && loan.borrowerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to reject this loan proposal." });
        }

        loan.status = 'REJECTED';
        await loan.save();
        res.json({ success: true, message: 'Loan proposal rejected' });
    } catch (err) {
        console.error("Loan reject error:", err);
        res.status(500).json({ success: false, message: "Could not reject loan proposal at this time." });
    }
});

// FORECLOSURE / FULL PREPAYMENT (Atomic Settlement with pinLimiter)
router.post('/foreclose/:id', authMiddleware, pinLimiter, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ success: false, message: "Security PIN is strictly required to confirm loan foreclosure." });
        }

        const loan = await Loan.findById(req.params.id);
        if (!loan || !['ACTIVE', 'OVERDUE'].includes(loan.status)) {
            return res.status(400).json({ success: false, message: 'Loan cannot be foreclosed at this status.' });
        }

        if (loan.borrowerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only the borrower can initiate full foreclosure.' });
        }

        const borrower = await User.findById(loan.borrowerId);
        const lender = await User.findById(loan.lenderId);

        let isMatch = false;
        if (borrower.upiPin && borrower.upiPin.startsWith("$2b$")) {
            isMatch = await bcrypt.compare(pin, borrower.upiPin);
        } else {
            isMatch = (borrower.upiPin === pin);
        }
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid security PIN. Foreclosure confirmation aborted.' });
        }

        const foreclosureAmount = Number(loan.remainingAmount);

        if (borrower.bankbalance < foreclosureAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient balance to foreclose loan. You need ₹${foreclosureAmount.toFixed(2)} but currently have ₹${borrower.bankbalance.toFixed(2)}.` 
            });
        }

        const updatedBorrower = await User.findOneAndUpdate(
            { _id: loan.borrowerId, bankbalance: { $gte: foreclosureAmount } },
            { $inc: { bankbalance: -foreclosureAmount } },
            { new: true }
        );

        if (!updatedBorrower) {
            return res.status(400).json({ success: false, message: "Insufficient balance at exact foreclosure execution time." });
        }

        await User.findByIdAndUpdate(loan.lenderId, { $inc: { bankbalance: foreclosureAmount } });

        loan.status = 'FORECLOSED';
        loan.remainingAmount = 0;
        loan.remainingInstallments = 0;
        await loan.save();

        if (!loan.hadOverdue) {
            borrower.trustScore = Math.min(100, (borrower.trustScore || 50) + 5);
            borrower.completedLoansAsBorrower = (borrower.completedLoansAsBorrower || 0) + 1;
            await borrower.save();
        }

        const refId = `FORECLOSE-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        await Transaction.create({
            senderId: borrower._id,
            senderName: borrower.name || borrower.username,
            senderUpiId: borrower.username,
            receiverId: lender._id,
            receiverName: lender.name || lender.username,
            receiverUpiId: lender.username,
            amount: foreclosureAmount,
            type: 'LOAN_FORECLOSURE',
            category: 'Foreclosure',
            description: `Full prepayment and closure of Loan #${loan._id.toString().slice(-6)} (0 closure fees)`,
            status: 'SUCCESS',
            referenceId: refId
        });

        await Notification.create({
            userId: borrower._id,
            title: "🎉 Loan Foreclosed Successfully!",
            message: `You paid the complete remaining balance of ₹${foreclosureAmount.toFixed(2)} for Loan #${loan._id.toString().slice(-6)}. All future EMIs are terminated.`,
            type: "GENERAL"
        });

        await Notification.create({
            userId: lender._id,
            title: "💵 Loan Settled & Foreclosed",
            message: `${borrower.name} has settled and foreclosed their loan completely by paying ₹${foreclosureAmount.toFixed(2)}.`,
            type: "GENERAL"
        });

        res.json({ success: true, message: 'Loan foreclosed successfully with zero additional fees!', loan });
    } catch (err) {
        console.error("Foreclosure error:", err);
        res.status(500).json({ success: false, message: "Foreclosure transaction failed due to server error." });
    }
});

// DEMONSTRATION & TESTING ENDPOINT: Disabled in production (Item 7)
router.post('/trigger-cron', authMiddleware, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ success: false, message: "Manual triggering of automated platform EMI scheduler is restricted in production environments." });
        }
        console.log("⚡ Manual Trigger of Auto EMI Deduction Engine requested in test environment.");
        const result = await runEmiDeductionEngine();
        res.json({ success: true, message: "Automated EMI Cron Engine executed successfully!", result });
    } catch (err) {
        console.error("Cron trigger error:", err);
        res.status(500).json({ success: false, message: "Cron execution simulation failed." });
    }
});

module.exports = router;
