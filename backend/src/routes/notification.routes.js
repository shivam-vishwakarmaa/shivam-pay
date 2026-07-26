const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const Notification = require('../models/Notification.model');

// Get user notifications (in-app alerts and sent emails)
router.get('/my-notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, notifications });
    } catch (err) {
        console.error("Fetch notifications error:", err);
        res.status(500).json({ success: false, message: "Could not retrieve notifications at this time." });
    }
});

// Mark all as read
router.put('/mark-read', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All marked as read' });
    } catch (err) {
        console.error("Mark read error:", err);
        res.status(500).json({ success: false, message: "Could not update notification status." });
    }
});

module.exports = router;
