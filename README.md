# ShivamPay 🚀 (Pro Fintech, Razorpay Payments & P2P Friend Lending System)

A state-of-the-art, high-fidelity fintech and peer-to-peer (P2P) financial platform built with the MERN stack. **ShivamPay** combines a clean professional dashboard (inspired by Payhelper) with real **Razorpay Payment Gateway** integration, automated scheduled EMI deduction engines, zero-cost loan foreclosure, and instant PIN-protected UPI transfers.

![ShivamPay Banner](https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

---

## ✨ Key Features & Architecture

### 💳 1. Real Money Wallet Top-Up via Razorpay Gateway
- **Secure Razorpay Popup**: Add real money to your ShivamPay wallet using any UPI app (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or Net Banking.
- **HMAC-SHA256 Signature Verification**: Server-side cryptographic verification prevents signature spoofing or balance tampering.
- **Bank-Grade Data Security**: Zero sensitive bank credentials, card numbers, or UPI PINs are ever stored in your database. Razorpay handles 100% of the PCI-DSS compliance.
- **INR (₹) Standard**: Native processing in Indian Rupees (₹).

---

### 🤝 2. P2P Friend Loan & Automated EMI Deduction Engine
- **Customizable Financial Agreements**: Offer or request loans from peers with flexible Principal (₹), Interest Rate (%), Duration (months), and preferred EMI deduction day of the month.
- **Atomic Balance Dispersal**: When a borrower accepts a loan proposal with their UPI PIN, funds are atomically debited from the lender and credited to the borrower.
- **Automated Monthly EMI Cron**: Powered by `node-cron`, the background engine automatically deducts monthly EMIs on scheduled due dates (or instantly via our in-app **"⚡ Simulate EMI Run"** test trigger).
- **One-Click Zero-Fee Foreclosure**: Borrowers can settle their entire remaining loan dues at any time with **₹0.00 prepayment penalties or early closure fees**.

---

### ✉️ 3. Insufficient Balance Automated Email & In-App Alerts
- If a borrower's wallet balance is insufficient on the scheduled EMI due date:
  - The loan status automatically shifts to **`OVERDUE`**.
  - **Automated Nodemailer Alert**: Dispatches an immediate warning email detailing the exact shortfall and due payment.
  - **Live Web Preview**: Integrates with **Ethereal Mail** for instant, zero-setup HTML email preview links right inside the notifications inbox.

---

### 🎨 4. Professional UI Redesign (Payhelper-Inspired)
- **Dark Sidebar Layout**: Instant tab navigation across *Home*, *Payments*, *Loans & EMI*, *History*, *Notifications*, and *Settings*.
- **White Card Aesthetics**: High contrast, crisp typography (`Inter` & `JetBrains Mono`), and color-coded status badges (`Active`, `Pending`, `Overdue`, `Completed`).
- **Interactive Utility Modals**: Modals for UPI Transfers, Receive QR Code, QR Camera Simulator, Bill Payments (Electricity, Mobile, DTH, Water), and Printable PDF Invoices.

---

## 🛠️ Tech Stack

### Frontend (Vite + React)
- **React 19 & React-Router-DOM**: Super fast SPA navigation with zero page reloads.
- **Tailwind CSS v4**: Utility-first CSS styling with custom design tokens.
- **Razorpay Checkout SDK**: Embedded modal checkout interface.
- **Qrcode.react & Canvas-Confetti**: SVG QR generation & celebratory micro-animations.

### Backend (Node.js + Express + MongoDB)
- **Express.js**: REST API server with JWT authentication.
- **MongoDB Atlas & Mongoose**: Schema validation with ACID database transactions.
- **MongoDB Memory Server**: Built-in 3-tier database fallback (Atlas → Local MongoDB → In-Memory Mongo) so the app boots 100% offline without crashing.
- **Razorpay Node SDK**: Order creation & HMAC-SHA256 signature verification.
- **Node-Cron & Nodemailer**: Background EMI scheduling and automated email dispatching.

---

## 🚀 Getting Started Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- Git installed on your system

### 2. Clone the Repository
```bash
git clone https://github.com/shivam-vishwakarmaa/shivam-pay.git
cd shivam-pay
```

### 3. Setup & Start Backend Server
```bash
cd backend
npm install
npm start
```
*The backend boots up on `http://localhost:3000` with automated cron schedulers active.*

### 4. Setup & Start Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend Vite dev server will start on `http://localhost:5173`.*

---

## 🔑 How to Enable Real Razorpay Payments (Optional)

1. Sign up for a free account at **[dashboard.razorpay.com](https://dashboard.razorpay.com)**.
2. Go to **Settings → API Keys → Generate Test Key**.
3. Open `backend/.env` and replace the placeholder keys:
   ```env
   RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
   ```
4. Restart your backend (`npm start`). Click **"Add Money"** on the dashboard to test live/test payments via Razorpay!

---

## ⚡ Step-by-Step Feature Testing Guide

### 1. Registering & Sandbox Balance
- Open `http://localhost:5173` and click **"Get Started — Free"**.
- Create an account (e.g. `alex`). You will automatically receive a free **₹10,000 Sandbox Balance** and a custom UPI ID: `alex@shivampay`. Default UPI PIN is `1234`.

### 2. Instant UPI Money Transfer
- Register a second account in an incognito window (e.g. `bob`).
- Log in as `alex`, click **"Send Money"** (or select Bob from the Peer Directory), enter amount `₹500` and PIN `1234`.
- Bob's balance increases by ₹500 in real time!

### 3. P2P Friend Loan & EMI Dispersal
- Log in as `alex`, navigate to **Loans & EMI**, and click **"New Loan"**.
- Set Role to **I'm Lending**, Partner to `bob`, Principal `₹2,000`, Interest `5%`, Tenure `4 Months`, and Deduction Day `5th`.
- Log in as `bob` under **Loans & EMI** and click **"Accept & Disperse"** entering PIN `1234`.
- Bob receives ₹2,000 instantly from Alex's account!

### 4. Test Automated EMI Cron Execution
- Click the **"⚡ Simulate EMI Run"** button in the Loans tab.
- The background engine will execute the monthly EMI deduction automatically and report the results!

### 5. Test Zero-Fee Foreclosure
- As `bob`, click **"Pay Full Amount — ₹0 Closure Fee"** under your active loan.
- Enter PIN `1234`. The remaining dues are settled at once with $0 early penalty fees, screen confetti triggers, and the loan closes!

---

Made with ❤️ by [Shivam Vishwakarma](https://github.com/shivam-vishwakarmaa).
