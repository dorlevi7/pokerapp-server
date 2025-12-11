// server/routes/notificationRoutes.js
const express = require("express");

const {
    sendNotification,
    getUserNotifications,
    markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

// 🟢 Send notification(s)
router.post("/send", sendNotification);

// 🔵 Get notifications for a specific user
router.get("/user/:userId", getUserNotifications);

// 🟣 Mark a specific notification as read
router.put("/:notificationId/read", markAsRead);

module.exports = router;
