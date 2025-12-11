// server/routes/notificationRoutes.js
const express = require("express");

const {
    sendNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead, // ⭐ NEW
} = require("../controllers/notificationController");

const router = express.Router();

// 🟢 Send notification(s)
router.post("/send", sendNotification);

// 🔵 Get notifications for a specific user
router.get("/user/:userId", getUserNotifications);

// 🟣 Mark a specific notification as read
router.put("/:notificationId/read", markAsRead);

// 🟡 ⭐ NEW: Mark ALL notifications for a user as read
router.put("/user/:userId/read-all", markAllAsRead);

module.exports = router;
