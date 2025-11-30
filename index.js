// Load environment variables
require("dotenv").config();

// Express and middleware
const express = require("express");
const cors = require("cors");

// Database connection (from db.js)
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());              // Allow requests from client
app.use(express.json());      // Parse JSON bodies

// Test route to check server status
app.get("/", (req, res) => {
    res.json({ message: "PokerApp server is running" });
});

// Test route to check DB connection
app.get("/test-db", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            success: true,
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("DB test error:", error);
        res.status(500).json({ success: false, error: "Database connection failed" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
