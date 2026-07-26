# ShivamPay

A peer-to-peer fintech platform built with the MERN stack. Real money top-ups via **Razorpay**, instant wallet-to-wallet transfers, and automated P2P friend loans with scheduled EMI deductions.

---

## Features

### Real Payments via Razorpay
- Add real money to your wallet using any UPI app, credit/debit card, or net banking
- HMAC-SHA256 signature verification prevents tampering
- Your database never stores card numbers, bank passwords, or UPI PINs — Razorpay handles all sensitive data

### P2P Friend Loans & Automated EMI
- Lend or borrow from other users with customizable interest rates, duration, and EMI dates
- Automated cron engine deducts EMI from the borrower's wallet on the scheduled day each month
- If the borrower has insufficient balance, an email alert is automatically sent
- Borrowers can settle their full loan at any time with ₹0 closure fees

### Wallet Transfers
- Send money to any other ShivamPay user instantly
- PIN-protected transactions
- Complete transaction history with receipts

---

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, Razorpay Checkout SDK  
**Backend:** Node.js, Express, MongoDB (Mongoose), Razorpay SDK, node-cron, Nodemailer, JWT, bcrypt

---

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/shivam-vishwakarmaa/shivam-pay.git
cd shivam-pay
```

### 2. Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3000`.

### 3. Start Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4. Enable Real Payments (Required)

1. Create a free Razorpay account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Open `backend/.env` and add your keys:

```env
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
```

4. Restart the backend. The "Add Money" button will now open Razorpay's secure checkout.

---

## How to Use

1. **Create an account** at `http://localhost:5173/register` — enter your name, username, email, and password
2. **Add money** — click "Add Money" on the dashboard, enter an amount, and pay via Razorpay's secure popup (UPI/card/net banking)
3. **Send money** — go to "Send Money", enter the recipient's username, amount, and your PIN (default: 1234)
4. **Create a loan** — go to "Loans & EMI", click "New Loan", fill in the terms, and send the proposal
5. **Accept a loan** — the recipient logs in, sees the pending loan, and clicks "Accept" with their PIN. Funds transfer instantly
6. **Settle early** — borrowers can click "Pay Full — ₹0 Fee" to clear the remaining balance at any time

---

## Security

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT token-based authentication
- Razorpay HMAC-SHA256 signature verification on every payment
- Sensitive fields (`password`, `upiPin`) are excluded from all API responses
- `.env` file is gitignored — API keys never enter version control

---

Made by [Shivam Vishwakarma](https://github.com/shivam-vishwakarmaa)
