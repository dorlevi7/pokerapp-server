// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes"); // ⭐ NEW

dotenv.config();

const app = express();

// ✅ Middleware — allow all origins
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes); // ⭐ NEW

// ✅ Root route (test)
app.get("/", (req, res) => {
    res.send("PokerApp API is running 🚀");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
});
