// server/routes/userRoutes.js
const express = require("express");
const { signup, login, getProfile } = require("../controllers/userController");

const router = express.Router();

// 🧠 Create a new user
// POST /api/users/signup
router.post("/signup", signup);

// 🔑 Login
// POST /api/users/login
router.post("/login", login);

// 👤 Get user details (currently — without JWT authentication, will be added later)
router.get("/profile", getProfile);

module.exports = router;
