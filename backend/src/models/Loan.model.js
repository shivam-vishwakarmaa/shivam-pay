const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lenderName: String,
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowerName: String,
    principalAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // percentage per annum / duration
    durationMonths: { type: Number, required: true },
    totalPayableAmount: { type: Number, required: true },
    emiAmount: { type: Number, required: true },
    remainingInstallments: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    deductionDayOfMonth: { type: Number, required: true, min: 1, max: 28, default: 5 },
    nextDueDate: { type: Date },
    status: { 
        type: String, 
        enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'OVERDUE', 'FORECLOSED'], 
        default: 'PENDING' 
    },
    hadOverdue: { type: Boolean, default: false },
    remarks: String
}, { timestamps: true });

module.exports = mongoose.model("Loan", loanSchema);
