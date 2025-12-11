const pool = require("../db");

// 🟢 Send notifications to multiple users
async function sendNotification({ senderId, receiverIds, title, message }) {
    if (!senderId) {
        throw new Error("senderId is required");
    }
    if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
        throw new Error("receiverIds array is required");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // ⚙️ Create insert template
        const insertValues = receiverIds
            .map((_, idx) => `($1, $2, $3, $${idx + 4})`)
            .join(", ");

        const queryParams = [senderId, title || null, message, ...receiverIds];

        const result = await client.query(
            `
            INSERT INTO notifications (sender_id, title, message, receiver_id)
            VALUES ${insertValues}
            RETURNING id, sender_id, receiver_id, title, message, is_read, created_at
            `,
            queryParams
        );

        await client.query("COMMIT");
        return result.rows;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error sending notifications:", error);
        throw error;
    } finally {
        client.release();
    }
}

// 🔵 Get all notifications for a user (sorted newest → oldest)
async function getUserNotifications(userId) {
    try {
        const result = await pool.query(
            `
            SELECT 
                n.id,
                n.sender_id,
                u.username AS sender_username,
                u.first_name AS sender_first_name,
                u.last_name AS sender_last_name,
                n.receiver_id,
                n.title,
                n.message,
                n.is_read,
                n.created_at
            FROM notifications n
            LEFT JOIN users u ON u.id = n.sender_id
            WHERE n.receiver_id = $1
            ORDER BY n.created_at DESC
            `,
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        throw error;
    }
}

// 🟣 Mark a specific notification as read
async function markAsRead(notificationId) {
    try {
        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = $1
            RETURNING id, receiver_id, is_read
            `,
            [notificationId]
        );

        return result.rows[0];
    } catch (error) {
        console.error("❌ Error marking notification as read:", error);
        throw error;
    }
}

// 🟡 ⭐ NEW: Mark ALL notifications for user as read
async function markAllAsRead(userId) {
    try {
        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE receiver_id = $1 AND is_read = FALSE
            RETURNING id, receiver_id, is_read, created_at
            `,
            [userId]
        );

        return result.rows; // returns all updated notifications
    } catch (error) {
        console.error("❌ Error marking all notifications as read:", error);
        throw error;
    }
}

module.exports = {
    sendNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,   // ⭐ Export new function
};
