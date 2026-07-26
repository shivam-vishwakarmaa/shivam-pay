# ShivamPay 💳

A production-grade, secure peer-to-peer (P2P) fintech platform built with the MERN stack. Features real money wallet top-ups via **Razorpay**, Google OAuth 2.0 authentication, instant wallet-to-wallet transfers, rate-limited endpoints, and automated P2P friend loans with scheduled EMI deductions.

---

## 🌟 Key Features

### 🔒 Enterprise-Grade Security
- **Mandatory 4-Digit Security PIN:** Every financial operation (transfers, loan acceptance, early foreclosures) requires authorization with a 4-digit PIN hashed via `bcrypt`.
- **Real Google OAuth 2.0:** Secure single sign-on with server-side ID Token validation (`google-auth-library`).
- **Strict Startup Validation:** Application fails fast if essential environment variables (`MONGODB_URI`, `JWT_SECRET`) are missing. No hardcoded fallback secrets or database credentials.
- **Rate Limiting:** Protects auth endpoints (50 req/15min), transaction endpoints (100 req/15min), and PIN authorization (15 attempts/15min lockout) using `express-rate-limit`.
- **Zero Sensitive Data Storage:** Card numbers, bank passwords, and UPI PINs are never stored in your database; Razorpay handles all gateway compliance.

### 💳 Real Payments via Razorpay
- Direct wallet top-ups using UPI, Credit/Debit cards, Net Banking, and Wallet apps.
- **Cryptographic HMAC-SHA256 Signature Verification** prevents tampering.
- Server-side verification fetches verified payment amounts directly from Razorpay APIs to eliminate client-side manipulation.

### 🤝 P2P Friend Loans & Automated EMI Engine
- **Flexible Terms:** Propose loans as a Lender or Borrower with customizable interest rates, durations, and scheduled monthly EMI deduction dates.
- **Automated Deduction Engine:** Daily scheduled cron engine (`node-cron`) automatically processes EMIs on due dates using atomic wallet transactions.
- **Early Foreclosure (Zero Fee):** Borrowers can settle their entire remaining loan balance at any time with ₹0 prepay fees.
- **Email & In-App Alerts:** Automated notification delivery via Nodemailer on loan proposals, disbursements, EMI payments, and low balance warnings.

### ⚡ Atomic Wallet Transfers
- Instant wallet-to-wallet P2P transfers using username search.
- Race-condition proof atomic MongoDB operations (`findOneAndUpdate` with balance condition checks).
- Full transaction history with receipts and reference IDs.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Vanilla CSS Design System (Sleek Light Mode), `@react-oauth/google`, Razorpay Checkout SDK
- **Backend:** Node.js, Express, MongoDB (Mongoose), Razorpay SDK, `google-auth-library`, `bcrypt`, `express-rate-limit`, `node-cron`, `nodemailer`, `jsonwebtoken`, `zod`

---

## 🚀 Getting Started

### 1. Repository Setup

```bash
git clone https://github.com/shivam-vishwakarmaa/shivam-pay.git
cd shivam-pay
```

### 2. Backend Configuration & Launch

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shivampay?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

Start backend dev server:

```bash
npm run dev
```

### 3. Frontend Configuration & Launch

In a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

Start frontend dev server:

```bash
npm run dev
```

Visit application at `http://localhost:5173`.

---

## 📖 How to Use

1. **Sign Up / Login:** Register with an email/username and set a mandatory 4-digit Security PIN, or click **"Continue with Google"** for one-click SSO.
2. **Add Money:** Click **"Add Money"** on your dashboard summary, enter an amount, and complete payment via Razorpay's secure checkout.
3. **Send Money:** Navigate to **"Send Money"**, search for any registered username, enter amount & description, and confirm with your 4-digit PIN.
4. **Initiate P2P Loan:** Go to **"Loans & EMI"**, click **"New Loan"**, set parameters (Lender/Borrower, principal, interest %, duration, EMI day), and submit the proposal.
5. **Accept & Disburse:** The counterparty receives an instant notification, views terms, and authorizes disbursement with their 4-digit PIN. Funds transfer atomically.
6. **Automated EMI & Settlement:** EMIs auto-deduct on your chosen day of the month. Borrowers can click **"Pay Full — ₹0 Fee"** to foreclose early at any time.

---

## 🛡️ Security Highlights

- **Bcrypt Password & PIN Hashing:** 10 salt rounds applied to all passwords and security PINs.
- **Atomic Financial Transactions:** Multi-step balance mutations run atomically to prevent double-spending and race conditions.
- **Sanitized Server Errors:** Raw exception messages are never exposed to API consumers.
- **Fail-Fast Environment Shield:** Ensures production builds cannot run with missing keys or unsafe fallbacks.

---

Made by [Shivam Vishwakarma](https://github.com/shivam-vishwakarmaa)
