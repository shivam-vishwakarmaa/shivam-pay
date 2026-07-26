const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User.model');
const Loan = require('../models/Loan.model');
const Transaction = require('../models/Transaction.model');
const Notification = require('../models/Notification.model');

// Create a disposable Ethereal Mail transporter or simulated mailer for instant zero-cost email notifications
let transporter = null;

async function setupTransporter() {
    try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
        } else {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('Ethereal Mail transporter initialized for zero-cost email alerts.');
        }
    } catch (err) {
        console.error('Failed to initialize nodemailer transporter, using fallback logger:', err.message);
    }
}

async function sendInsufficientBalanceEmail(borrower, loan, currentBalance) {
    if (!transporter) await setupTransporter();
    
    const subject = `⚠️ URGENT: Automated EMI Deduction Failed (Loan #${loan._id.toString().slice(-6)})`;
    const text = `Dear ${borrower.name || borrower.username},\n\n` +
                 `This is an automated alert from ShivamPay Lending & EMI Engine.\n\n` +
                 `Your scheduled monthly EMI deduction of ₹${loan.emiAmount} to lender ${loan.lenderName} failed today because your linked account has an insufficient balance (₹${currentBalance.toFixed(2)}).\n\n` +
                 `Loan Details:\n` +
                 `- Total Remaining Payable: ₹${loan.remainingAmount.toFixed(2)}\n` +
                 `- Remaining Installments: ${loan.remainingInstallments}\n\n` +
                 `Please recharge your ShivamPay Account immediately or utilize One-Click Foreclosure to clear your dues.\n\n` +
                 `Best regards,\nShivamPay Financial System`;

    let previewUrl = "";
    let status = "FAILED";

    try {
        if (transporter) {
            const info = await transporter.sendMail({
                from: '"ShivamPay Auto-EMI Engine" <alerts@shivampay.tech>',
                to: borrower.email || `${borrower.username}@shivampay.tech`,
                subject: subject,
                text: text
            });
            status = "SENT";
            if (nodemailer.getTestMessageUrl(info)) {
                previewUrl = nodemailer.getTestMessageUrl(info);
                console.log(`Email dispatched to ${borrower.username}. Preview URL: ${previewUrl}`);
            }
        } else {
            status = "SENT";
            console.log(`[SIMULATED EMAIL TO ${borrower.username}] Subject: ${subject}`);
        }
    } catch (err) {
        console.error('Error sending email alert:', err.message);
        status = "FAILED";
    }

    await Notification.create({
        userId: borrower._id,
        title: "❌ EMI Deduction Failed (Email Dispatched)",
        message: `Scheduled EMI deduction of ₹${loan.emiAmount} failed due to insufficient balance (₹${currentBalance.toFixed(2)}). Automated alert sent to your email!`,
        type: "EMAIL_ALERT",
        emailStatus: status,
        previewUrl: previewUrl
    });
}

// Core automated EMI engine with Atomic Debits (Item 8) and Due Date Filtering (Item 10)
async function runEmiDeductionEngine() {
    console.log("Starting Automated EMI Deduction Cron Job...");
    try {
        const now = new Date();
        // Item 10: Only process a loan when the current date matches (or has passed) that loan's nextDueDate
        const loans = await Loan.find({ 
            status: { $in: ['ACTIVE', 'OVERDUE'] },
            nextDueDate: { $lte: now }
        });
        console.log(`Found ${loans.length} due active/overdue loan(s) to process.`);

        const results = [];

        for (const loan of loans) {
            const borrower = await User.findById(loan.borrowerId);
            const lender = await User.findById(loan.lenderId);

            if (!borrower || !lender) {
                continue;
            }

            const emiAmount = Number(loan.emiAmount);
            const refId = `EMI-${Date.now()}-${Math.floor(Math.random()*10000)}`;

            // Item 8: Atomic EMI debit via findOneAndUpdate with balance filter
            const updatedBorrower = await User.findOneAndUpdate(
                { _id: loan.borrowerId, bankbalance: { $gte: emiAmount } },
                { $inc: { bankbalance: -emiAmount } },
                { new: true }
            );

            if (updatedBorrower) {
                const updatedLender = await User.findByIdAndUpdate(
                    loan.lenderId,
                    { $inc: { bankbalance: emiAmount } },
                    { new: true }
                );

                loan.remainingInstallments -= 1;
                loan.remainingAmount = Math.max(0, loan.remainingAmount - emiAmount);

                if (loan.remainingInstallments <= 0 || loan.remainingAmount <= 1) {
                    loan.status = 'COMPLETED';
                } else {
                    loan.status = 'ACTIVE';
                    const nextDate = new Date(loan.nextDueDate || now);
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    loan.nextDueDate = nextDate;
                }
                await loan.save();

                await Transaction.create({
                    senderId: borrower._id,
                    senderName: borrower.name || borrower.username,
                    senderUpiId: borrower.username,
                    receiverId: lender._id,
                    receiverName: lender.name || lender.username,
                    receiverUpiId: lender.username,
                    amount: emiAmount,
                    type: 'EMI_DEDUCTION',
                    category: 'Loan EMI',
                    description: `Automated EMI payment for Loan #${loan._id.toString().slice(-6)} to ${lender.name}`,
                    status: 'SUCCESS',
                    referenceId: refId
                });

                await Notification.create({
                    userId: borrower._id,
                    title: "✅ Automated EMI Paid",
                    message: `₹${emiAmount} deducted successfully for your loan with ${lender.name}. Remaining installments: ${loan.remainingInstallments}`,
                    type: "EMI_DEDUCTION"
                });

                await Notification.create({
                    userId: lender._id,
                    title: "💵 EMI Received",
                    message: `Received ₹${emiAmount} as automated EMI from ${borrower.name}.`,
                    type: "EMI_DEDUCTION"
                });

                results.push({ loanId: loan._id, status: 'SUCCESS', message: `Deducted ₹${emiAmount} successfully from ${borrower.username}.` });
            } else {
                loan.status = 'OVERDUE';
                await loan.save();

                await Transaction.create({
                    senderId: borrower._id,
                    senderName: borrower.name || borrower.username,
                    senderUpiId: borrower.username,
                    receiverId: lender._id,
                    receiverName: lender.name || lender.username,
                    receiverUpiId: lender.username,
                    amount: emiAmount,
                    type: 'EMI_DEDUCTION',
                    category: 'Loan EMI',
                    description: `Failed automated EMI deduction due to insufficient balance (₹${borrower.bankbalance})`,
                    status: 'FAILED',
                    referenceId: refId
                });

                await sendInsufficientBalanceEmail(borrower, loan, borrower.bankbalance);

                results.push({ loanId: loan._id, status: 'FAILED_EMAIL_SENT', message: `Insufficient balance for ${borrower.username}. Alert email sent.` });
            }
        }

        console.log("Automated EMI Deduction Job Completed:", results);
        return { success: true, results };
    } catch (err) {
        console.error("Error running EMI Deduction Engine:", err);
        return { success: false, error: "EMI engine processing failed." };
    }
}

function initEmiCron() {
    cron.schedule('0 0 * * *', () => {
        runEmiDeductionEngine();
    });
    console.log("🕒 Automated EMI Cron Scheduler initialized (Daily at 00:00).");
    setupTransporter();
}

module.exports = { initEmiCron, runEmiDeductionEngine };
