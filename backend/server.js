require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error("❌ Fatal Startup Error: JWT_SECRET environment variable is not set. Refusing to start.");
    process.exit(1);
}

const express = require("express");
const cors = require('cors');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const { initEmiCron } = require('./src/cron/emiCron');

const app = express();
app.set('trust proxy', 1);

// Production-ready CORS setup allowing cross-origin requests from deployed frontends (Vercel/Netlify)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Connect to MongoDB (Atlas / Local / In-Memory Fallback)
connectDB();

// Initialize Automated EMI Cron Service & Nodemailer
initEmiCron();

// Main API Routes
app.use("/pytm", routes);

// Health check endpoint for cloud monitoring (Render/Railway/Heroku)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "ShivamPay Backend is operating normally in production." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ShivamPay Production Backend running on port ${PORT}`);
});
