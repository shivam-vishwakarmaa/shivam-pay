const mongoose = require('mongoose');
const { string } = require('zod');

mongoose.connect("mongodb+srv://shivamvishwa844:Shivam$844@cluster0.4kxibsg.mongodb.net/");

const userSchema = mongoose.Schema({
    name : String,
    username : String,
    password : String,
    bankbalance: {
        type: Number,
        required: true,
        default: 1000
    },
})

const loanSchema = mongoose.Schema({
    lenderId : String,
    borrowerId : String,
    principalAmount : String,
    interestRate : String,
    status : String,
    createdAt : String
})

const User = mongoose.model("User", userSchema);
const LoanInfo = mongoose.model("LoanInfo",loanSchema) ; 

module.exports = {
    User,
    LoanInfo
}