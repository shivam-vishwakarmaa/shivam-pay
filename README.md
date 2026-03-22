# ShivamPay 🚀

A high-fidelity, premium fintech application designed for the modern era. ShivamPay combines cutting-edge aesthetics with robust security to provide a seamless payment experience.

![ShivamPay Banner](https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

## ✨ Features

- **Premium Dark Aesthetics**: A "Kinetic Midnight" theme featuring deep charcoal backgrounds and vibrant neon accents.
- **Micro-Interactions**: Smooth animations and glassmorphic effects for a tactile, high-end feel.
- **Secure Authentication**: JWT-based secure login and registration with encrypted passwords (bcrypt).
- **Real-time Transactions**: Securely send money to other users with ACID-compliant database transactions.
- **Dynamic Dashboard**: View your balance, quick-send to contacts, and manage your account in one place.
- **Responsive Design**: Fully optimized for mobile and desktop screens.

## 🛠️ Tech Stack

### Frontend
- **React**: Modern component-based architecture.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: For custom, utility-first premium styling.
- **Axios**: Promised-based HTTP client for API calls.

### Backend
- **Node.js & Express**: Scalable server-side logic.
- **MongoDB & Mongoose**: Flexible NoSQL database with session management for transactions.
- **JSON Web Token (JWT)**: Secure user session management.
- **Zod**: Robust schema validation for API requests.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- MongoDB account (Atlas or local)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivam-vishwakarmaa/shivam-pay.git
   cd shivam-pay
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` directory and add your MongoDB connection string (or use the one provided in `db.js`).

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   node server.js
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

```text
shivam-pay/
├── backend/            # Express server and database models
│   ├── routes/         # API endpoints
│   ├── Middlewares/    # Authentication logic
│   └── db.js           # Mongoose configuration
├── frontend/           # Vite + React application
│   ├── src/
│   │   ├── components/ # UI Components (Login, Dashboard, etc.)
│   │   ├── assets/     # Static assets
│   │   └── App.jsx     # Main application routing
└── README.md           # Documentation
```

## 🔒 Security Features

- **Atomic Transactions**: All payments use MongoDB sessions to ensure that money is never lost or duplicated during transfers.
- **JWT Authorization**: All sensitive routes are protected by a JWT middleware.
- **Password Salting**: Passwords are never stored in plain text.

## 📈 Future Roadmap

- [ ] Smart Recognition: Automatically detect recurring payments at the same location.
- [ ] Location Intelligence: Categorize spending by area/location for better financial insights.
- [ ] Transaction history graph (recharts).
- [ ] QR Code generation and scanning.
- [ ] Push notifications for successful payments.
- [ ] Bill payment integration.
- [ ] "Request Money" feature implementation.

---

Made with ❤️ by [Shivam Vishwakarma](https://github.com/shivam-vishwakarmaa)
