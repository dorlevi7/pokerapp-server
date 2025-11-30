// server/services/clickService.js
const pool = require("../db");

// Save a new click time into the database
async function saveClickTime() {
    try {
        const query = `
            INSERT INTO click_times (clicked_at)
            VALUES (NOW() AT TIME ZONE 'UTC' + INTERVAL '2 hours')
            RETURNING *;
        `;
        const result = await pool.query(query);
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error saving click time:", error);
        throw error;
    }
}

// Get recent click times ordered from newest to oldest
async function getRecentClickTimes(limit = 20) {
    try {
        const query = `
            SELECT id, clicked_at::timestamptz AS clicked_at
            FROM click_times
            ORDER BY clicked_at DESC
            LIMIT $1;
        `;
        const result = await pool.query(query, [limit]);
        return result.rows;
    } catch (error) {
        console.error("❌ Error retrieving click times (detailed):", error);
        throw error;
    }
}

module.exports = {
    saveClickTime,
    getRecentClickTimes,
};
