const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const clickRoutes = require("./routes/clickRoutes");

dotenv.config();

const app = express();

// ✅ Middleware — allow all origins (important for ngrok)
app.use(
    cors({
        origin: "*", // Allow requests from anywhere (mobile via ngrok)
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(express.json());

// ✅ Routes
app.use("/api/clicks", clickRoutes);

// ✅ Root test
app.get("/", (req, res) => {
    res.send("PokerApp Server is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
});
