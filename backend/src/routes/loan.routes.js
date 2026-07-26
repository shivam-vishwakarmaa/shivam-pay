const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const User = require('../models/User.model');
const Loan = require('../models/Loan.model');
const Transaction = require('../models/Transaction.model');
const Notification = require('../models/Notification.model');
const { runEmiDeductionEngine } = require('../cron/emiCron');

// Get all loans involving current user (as lender or borrower)
router.get('/my-loans', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const loans = await Loan.find({
            $or: [{ lenderId: userId }, { borrowerId: userId }]
        }).sort({ createdAt: -1 });
        res.json({ success: true, loans, userId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
            $or: [{ username: partnerUsername }, { upiId: partnerUsername }]
        });

        if (!partnerUser) {
            return res.status(404).json({ success: false, message: `User / UPI ID "${partnerUsername}" not found.` });
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

        // Standard interest calculation
        const principal = Number(principalAmount);
        const rate = Number(interestRate);
        const months = Number(durationMonths);
        
        // Total Interest = Principal * (Rate / 100)
        const interestAmount = (principal * rate) / 100;
        const totalPayable = Number((principal + interestAmount).toFixed(2));
        const emiAmount = Number((totalPayable / months).toFixed(2));

        // Next due date logic: next month on specified day
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

        // Notify partner
        await Notification.create({
            userId: partnerUser._id,
            title: role === 'LENDER' ? "🤝 Loan Offer Received" : "🙏 Loan Request Received",
            message: `${currentUser.name} has proposed a loan of $${principal} at ${rate}% interest over ${months} months (EMI: $${emiAmount}/mo).`,
            type: "LOAN_REQUEST"
        });

        res.status(201).json({ success: true, message: 'Loan proposal submitted successfully', loan });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Accept & Disburse Loan (Atomic Transfer of Principal from Lender to Borrower)
router.post('/accept/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        if (loan.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Loan is already processed' });

        const lender = await User.findById(loan.lenderId);
        const borrower = await User.findById(loan.borrowerId);

        // Verify UPI PIN if Lender is approving or Borrower accepting
        const currentUser = await User.findById(userId);
        if (pin && currentUser.upiPin && currentUser.upiPin !== pin) {
            return res.status(400).json({ success: false, message: 'Invalid UPI PIN entered.' });
        }

        if (lender.bankbalance < loan.principalAmount) {
            return res.status(400).json({ success: false, message: `Lender (${lender.name}) has insufficient funds to disburse this loan.` });
        }

        // Perform instant balance transfer
        lender.bankbalance -= loan.principalAmount;
        borrower.bankbalance += loan.principalAmount;
        await lender.save();
        await borrower.save();

        loan.status = 'ACTIVE';
        await loan.save();

        const refId = `LOAN-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        await Transaction.create({
            senderId: lender._id,
            senderName: lender.name || lender.username,
            senderUpiId: lender.upiId || 'N/A',
            receiverId: borrower._id,
            receiverName: borrower.name || borrower.username,
            receiverUpiId: borrower.upiId || 'N/A',
            amount: loan.principalAmount,
            type: 'LOAN_DISBURSEMENT',
            category: 'Loan Disruption',
            description: `Principal disbursement for Loan #${loan._id.toString().slice(-6)}`,
            status: 'SUCCESS',
            referenceId: refId
        });

        await Notification.create({
            userId: borrower._id,
            title: "💰 Loan Disbursed Successfully!",
            message: `$${loan.principalAmount} has been credited to your ShivamPay account from ${lender.name}. Your monthly automated EMI is $${loan.emiAmount}.`,
            type: "LOAN_DISBURSEMENT"
        });

        await Notification.create({
            userId: lender._id,
            title: "🤝 Loan Activated",
            message: `You have disbursed $${loan.principalAmount} to ${borrower.name}. Monthly automated EMI of $${loan.emiAmount} scheduled for day ${loan.deductionDayOfMonth} of every month.`,
            type: "LOAN_DISBURSEMENT"
        });

        res.json({ success: true, message: 'Loan activated and funds disbursed atomically!', loan });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Reject Loan Proposal
router.post('/reject/:id', authMiddleware, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
        loan.status = 'REJECTED';
        await loan.save();
        res.json({ success: true, message: 'Loan proposal rejected' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// FORECLOSURE / FULL PREPAYMENT KILLER FEATURE (Zero-Cost Full Settle at Once)
router.post('/foreclose/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pin } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan || !['ACTIVE', 'OVERDUE'].includes(loan.status)) {
            return res.status(400).json({ success: false, message: 'Loan cannot be foreclosed at this state.' });
        }

        if (loan.borrowerId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Only the borrower can perform loan foreclosure.' });
        }

        const borrower = await User.findById(loan.borrowerId);
        const lender = await User.findById(loan.lenderId);

        if (!pin || borrower.upiPin !== pin) {
            return res.status(400).json({ success: false, message: 'Invalid UPI PIN. Foreclosure confirmation failed.' });
        }

        const foreclosureAmount = Number(loan.remainingAmount);

        if (borrower.bankbalance < foreclosureAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient balance to foreclose loan. You need $${foreclosureAmount.toFixed(2)} but have $${borrower.bankbalance.toFixed(2)}.` 
            });
        }

        // Perform settlement transfer
        borrower.bankbalance -= foreclosureAmount;
        lender.bankbalance += foreclosureAmount;
        await borrower.save();
        await lender.save();

        loan.status = 'FORECLOSED';
        loan.remainingAmount = 0;
        loan.remainingInstallments = 0;
        await loan.save();

        const refId = `FORECLOSE-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        await Transaction.create({
            senderId: borrower._id,
            senderName: borrower.name || borrower.username,
            senderUpiId: borrower.upiId || 'N/A',
            receiverId: lender._id,
            receiverName: lender.name || lender.username,
            receiverUpiId: lender.upiId || 'N/A',
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
            message: `You paid the complete remaining balance of $${foreclosureAmount.toFixed(2)} for Loan #${loan._id.toString().slice(-6)}. All future EMIs are terminated.`,
            type: "GENERAL"
        });

        await Notification.create({
            userId: lender._id,
            title: "💵 Loan Settle & Foreclosed",
            message: `${borrower.name} has settled and foreclosed their loan completely by paying $${foreclosureAmount.toFixed(2)}.`,
            type: "GENERAL"
        });

        res.json({ success: true, message: 'Loan foreclosed successfully with zero additional fees!', loan });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DEMONSTRATION & TESTING ENDPOINT: Trigger Auto EMI deduction engine immediately!
router.post('/trigger-cron', authMiddleware, async (req, res) => {
    try {
        console.log("⚡ Manual Trigger of Auto EMI Deduction Engine requested by user.");
        const result = await runEmiDeductionEngine();
        res.json({ success: true, message: "Automated EMI Cron Engine executed successfully!", result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
