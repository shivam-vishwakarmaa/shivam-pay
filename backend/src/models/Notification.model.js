const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['EMAIL_ALERT', 'EMI_DEDUCTION', 'LOAN_REQUEST', 'LOAN_DISBURSEMENT', 'UPI_RECEIPT', 'GENERAL'], 
        default: 'GENERAL' 
    },
    emailStatus: { type: String, enum: ['SENT', 'FAILED', 'N/A'], default: 'N/A' },
    previewUrl: { type: String, default: '' }, // For Ethereal email preview link
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
