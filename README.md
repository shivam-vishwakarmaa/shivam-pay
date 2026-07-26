# ShivamPay 🚀 (Pro Fintech & Automated P2P Friend Lending System)

A state-of-the-art, high-fidelity fintech and peer-to-peer (P2P) financial platform. **ShivamPay** combines cutting-edge aesthetics with fully automated scheduled EMI deduction engines, zero-cost loan foreclosure, and instant PIN-protected UPI transfers.

![ShivamPay Pro Banner](https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

---

## ✨ Key Killer Features

### 💳 1. 100% Free Complete UPI Payment Service
- **Automatic UPI ID Assignment**: Every registered user immediately receives a personalized `@shivampay` interoperable ID.
- **Interactive QR Code Generation & Reception**: Receive funds instantly without platform fees by sharing your custom QR code.
- **Simulated Camera QR Scanner**: Contactless Scan & Pay interface allowing instant transfer simulation to any peer in the directory.
- **PIN-Protected Transactions**: All transfers require verification of the user's 4-digit UPI PIN (Default: `1234`).
- **Utility Bill Payments**: Pay simulated electricity, DTH, water, and mobile recharge bills with instant ACID database deduction and invoice generation.
- **Immutable Audit Ledger**: Filter, view, and print verified PDF transaction invoices with complete timestamps and reference IDs.

---

### 🤝 2. P2P Friend Loan & Automated EMI Deduction Engine (Core Extra Feature)
- **Customizable Financial Terms**: Offer or request loans from peers with flexible Principal amount ($), Interest Rate (%) per duration, and Tenure (number of months).
- **Automated Monthly EMI Cron Engine**: Powered by `node-cron`, the background scheduler runs daily at midnight (or instantly via our in-app **"⚡ Simulate Auto EMI Cron Now"** test button) to automatically withdraw EMI dues on the designated day of each month.
- **Atomic Balance Dispersal**: When a loan proposal is accepted, the principal amount is transferred directly from Lender to Borrower in an atomic MongoDB transaction.

---

### ✉️ 3. Insufficient Balance Automated Email & In-App Alerts
- If a borrower's linked bank account lacks sufficient balance on the scheduled EMI due date:
  - The loan status automatically switches to **`OVERDUE`**.
  - **Automated Nodemailer Alert**: The engine dispatches an immediate warning email (powered by **Ethereal Mail** / SMTP) informing the borrower of the failed deduction and pending dues.
  - **In-App Alert & Preview Inbox**: Users can monitor dispatched emails and click live web preview links right from the Notifications Command Tab!

---

### 🎉 4. One-Click Zero-Fee Foreclosure (Prepayment Feature)
- Borrowers have complete financial liberty to pay off their total remaining loan amount at any time with a single tap.
- **0.00 Early Closure Fees**: As requested, full early settlement is completely free of cost. Upon entering the UPI PIN, the remaining dues are transferred atomically, celebratory confetti triggers (`canvas-confetti`), and all future automated EMIs terminate instantly.

---

## 🛠️ Tech Stack

### Frontend (Vite + React)
- **React 19 & React-Router-DOM**: Super fast modular component styling with zero reload transitions.
- **Tailwind CSS & Kinetic Dark Theme**: Vibrant neon gradients (`#E1AAFF`, `#00D1FF`, `#BD88FF`) on ultra-deep charcoal backgrounds (`#0E1117`).
- **Lucide-React & Canvas-Confetti**: Aesthetic micro-interactions and celebratory animations.
- **Qrcode.react**: Real-time high-contrast SVG QR Code generation.
- **Axios**: Promised-based HTTP requests with JWT authorization headers.

### Backend (Node.js + Express + MongoDB)
- **Express & MongoDB Atlas (Mongoose)**: NoSQL schemas with ACID database transaction support and session management.
- **Node-Cron**: Background daily scheduled execution for automated EMI withdrawals.
- **Nodemailer**: Automated real and Ethereal simulated email dispatching on insufficient funds.
- **JSON Web Token (JWT) & Bcrypt**: 256-bit secure session and password hashing.
- **Zod**: Robust request validation schemas.

---

## 🚀 Getting Started & Simulation Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas or local connection

### Installation & Launch

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivam-vishwakarmaa/shivam-pay.git
   cd shivam-pay
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm start
   ```
   *Server boots up on `http://localhost:3000` with automated cron engines active.*

3. **Start Frontend Client**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *Vite server opens on `http://localhost:5173`.*

---

## ⚡ How to Demonstrate the P2P Loan & EMI Features

1. **Create Two Test Accounts** (e.g., **Alice** & **Bob**). Every account starts with a free **$10,000 Sandbox Balance** and UPI PIN `1234`.
2. **Propose a Loan**: Log in as Alice, go to the **P2P Friend Loans** tab, and offer a **$500** loan to `bob` at **10% interest** over **5 months** with the EMI scheduled on the **5th of the month**.
3. **Disperse Funds**: Log in as Bob. In the loans tab, accept Alice's offer by entering PIN `1234`. Observe **$500 atomically transferred** from Alice's balance to Bob's!
4. **Simulate Automated EMI Deduction**: Click the **"⚡ Simulate Auto EMI Cron Now"** button. Watch the backend engine deduct the exact monthly installment automatically!
5. **Test Insufficient Balance Email Alert**: If Bob's account falls below the monthly EMI amount during the cron run, an automated warning email is generated and logged in Bob's **Alerts & Email Inbox**.
6. **Test Zero-Fee Foreclosure**: Click **"Pay Full Amount / Foreclosure"** to settle all remaining principal and interest in one click for $0 closure fees!

---

Made with ❤️ and high-performance engineering by [Shivam Vishwakarma](https://github.com/shivam-vishwakarmaa) & Antigravity.
