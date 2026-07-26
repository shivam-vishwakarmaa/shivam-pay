const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    senderUpiId: String,
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverName: String,
    receiverUpiId: String,
    amount: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['UPI_SEND', 'UPI_RECEIVE', 'BILL_PAY', 'LOAN_DISBURSEMENT', 'EMI_DEDUCTION', 'LOAN_FORECLOSURE'],
        default: 'UPI_SEND'
    },
    category: { type: String, default: 'General' },
    description: String,
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
    referenceId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
