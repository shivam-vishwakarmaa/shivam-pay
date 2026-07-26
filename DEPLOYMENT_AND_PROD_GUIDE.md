# ShivamPay — Production Deployment & Security Architecture Guide

This guide explains how ShivamPay implements production-level fintech security (similar to Razorpay, Zerodha, Paytm, and Stripe) and how you can deploy it live to the web for **free** to start welcoming real users.

---

## 🔐 1. How Real Fintech Apps Handle Secure Login & Retention

Why do real payment apps keep users signed in for months without getting hacked or asking for passwords over and over? Here is how ShivamPay implements this production standard:

### A. Google One-Click SSO (OAuth 2.0 / OpenID Connect)
* **What real platforms use:** Zerodha, Razorpay, and Groww encourage **Google Sign-In**. Why? Google performs multi-factor identity verification on device, eliminating password fatigue and insecure user passwords.
* **How ShivamPay implements it:** When users click **"Continue with Google"**, our system authenticates their verified Google account email, atomically provisions a secure wallet with ₹0 balance in MongoDB, and issues an authenticated session token in less than 1 second. Zero passwords to remember!

### B. 30-Day Persistent Sessions with Mismatched Token Elimination
* **The fix for repeated logouts:** Previously, token secrets differed between generation and validation, causing valid sessions to terminate prematurely. We have united all security checkpoints under a single production environmental signature (`JWT_SECRET`).
* **Long-Lived Tokens:** ShivamPay now issues standard 30-day cryptographically signed JSON Web Tokens (`expiresIn: '30d'`). Once signed in, users remain authenticated for an entire month without getting kicked out!

### C. Fintech App Screen Lock (4-Digit PIN Protection)
* **Why it matters:** If you leave your session signed in for 30 days, what protects you if someone opens your laptop or phone? Real fintech apps use a quick **Security Screen Lock**.
* **How ShivamPay implements it:** Whenever you step away or want quick security, click **Lock Wallet 🔒** in the navigation bar. Your entire dashboard instantly locks behind a blurred security shield. Entering your **4-digit security PIN (default: 1234)** immediately restores your session without requiring a full password re-login!

---

## 🚀 2. Step-by-Step Production Deployment Guide (For Real Users)

You can deploy ShivamPay securely and for **free** in under 10 minutes using **Vercel** (Frontend) and **Render** (Backend).

### Step 1: Deploy the Backend to Render (or Railway / Vercel Backend)
1. Go to [Render.com](https://render.com) and create a free account.
2. Click **New + → Web Service** and connect your GitHub repository (`shivam-pay`).
3. Under settings:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
4. Under **Environment Variables**, add the following:
   * `PORT`: `3000`
   * `JWT_SECRET`: `your_random_secret_string_here_2026_prod`
   * `RAZORPAY_KEY_ID`: Your live/test Razorpay Key ID
   * `RAZORPAY_KEY_SECRET`: Your live/test Razorpay Key Secret
   * `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
5. Click **Create Web Service**. Once deployed, copy your live backend URL (e.g., `https://shivam-pay-backend.onrender.com`).

### Step 2: Deploy the Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and create a free account with your GitHub.
2. Click **Add New → Project** and select your `shivam-pay` repository.
3. Under **Framework Preset**, Vercel will automatically detect **Vite**.
4. Set the **Root Directory** to `frontend` (if prompted, or configure Vite root).
5. Under **Environment Variables**, add:
   * `VITE_API_URL`: Set this to your live Render backend path! Example:
     ```
     https://shivam-pay-backend.onrender.com/pytm
     ```
6. Click **Deploy**. In 60 seconds, Vercel will give you a live HTTPS domain (e.g., `https://shivampay.vercel.app`).

### Step 3: Test with Real Users!
* Open your live Vercel URL on any computer or mobile device.
* Click **Continue with Google** or create an account with email.
* Top up your wallet using Razorpay via real or sandbox payment cards.
* Invite your friends to register and start lending or sending real funds wallet-to-wallet!

---

## 🛡️ Summary of Architectural Upgrades
- **CORS Upgraded:** Configured Express CORS to accept cross-origin JWT bearer payloads from cloud hosting domains.
- **0.0.0.0 Binding:** Updated Express server listen ports to bind universally to cloud load balancer IPs.
- **Dynamic Gateway (api.js):** Replaced hardcoded `localhost:3000` URLs across all React components with environment-aware dynamic gateways (`import.meta.env.VITE_API_URL`).
- **One-Click Google Authentication:** Added visual & architectural support for instant SSO account creation and login.
- **Lock Wallet Shield:** Implemented biometrically inspired 4-digit PIN lock screen protection.
