// server/controllers/clickController.js
const clickService = require("../services/clickService");

// Handle POST /api/clicks - save a new click time
async function createClick(req, res) {
    try {
        console.log("📥 Received POST /api/clicks request");
        const savedClick = await clickService.saveClickTime();
        console.log("✅ Click saved successfully:", savedClick);
        res.status(201).json({
            success: true,
            data: savedClick,
        });
    } catch (error) {
        console.error("❌ Error in createClick:", error);
        res.status(500).json({
            success: false,
            error: "Failed to save click time",
        });
    }
}

// Handle GET /api/clicks - return recent click times
async function getClicks(req, res) {
    console.log("📩 Received GET /api/clicks request");
    try {
        const clicks = await clickService.getRecentClickTimes();
        console.log(`✅ Retrieved ${clicks.length} clicks`);
        res.json({
            success: true,
            data: clicks,
        });
    } catch (error) {
        console.error("❌ Error in getClicks:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch click times",
        });
    }
}

module.exports = {
    createClick,
    getClicks,
};
