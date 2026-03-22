const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
    lenderId: String,
    borrowerId: String,
    principalAmount: String,
    interestRate: String,
    status: String,
    createdAt: String
});

module.exports = mongoose.model("LoanInfo", loanSchema);
