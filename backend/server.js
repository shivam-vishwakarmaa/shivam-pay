require('dotenv').config();
const express = require("express");
const cors = require('cors');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const { initEmiCron } = require('./src/cron/emiCron');

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Initialize Automated EMI Cron Service & Nodemailer
initEmiCron();

// Main API Routes
app.use("/pytm", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ShivamPay High-Performance Backend running on port ${PORT}`);
});
