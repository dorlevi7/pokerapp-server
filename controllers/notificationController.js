// server/controllers/notificationController.js
const notificationService = require("../services/notificationService");

// 🟢 POST /api/notifications/send
async function sendNotification(req, res) {
    try {
        const { senderId, receiverIds, title, message } = req.body;

        if (!senderId || !Array.isArray(receiverIds) || receiverIds.length === 0 || !message) {
            return res.status(400).json({
                success: false,
                error: "senderId, receiverIds and message are required",
            });
        }

        const notifications = await notificationService.sendNotification({
            senderId,
            receiverIds,
            title: title || null,
            message,
        });

        res.status(201).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// 🔵 GET /api/notifications/user/:userId
async function getUserNotifications(req, res) {
    try {
        const { userId } = req.params;

        const notifications = await notificationService.getUserNotifications(userId);

        res.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

// 🟣 PUT /api/notifications/:notificationId/read
async function markAsRead(req, res) {
    try {
        const { notificationId } = req.params;

        const updated = await notificationService.markAsRead(notificationId);

        res.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error("❌ Error marking notification as read:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

module.exports = {
    sendNotification,
    getUserNotifications,
    markAsRead,
};
