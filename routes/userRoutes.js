// server/routes/userRoutes.js
const express = require("express");
const {
    signup,
    login,
    getProfile,
    checkUserExists,
    updateUser   // ⭐ NEW
} = require("../controllers/userController");

const router = express.Router();

// 🧠 Create a new user
router.post("/signup", signup);

// 🔑 Login
router.post("/login", login);

// 👤 Get user profile
router.get("/profile", getProfile);

// 🔍 Check if user exists (email OR username)
router.get("/exists", checkUserExists);

// ✏️ NEW — Update user information
router.put("/update", updateUser);

module.exports = router;
