// server/routes/userRoutes.js
const express = require("express");
const { signup, login, getProfile } = require("../controllers/userController");

const router = express.Router();

// 🧠 יצירת משתמש חדש
// POST /api/users/signup
router.post("/signup", signup);

// 🔑 התחברות
// POST /api/users/login
router.post("/login", login);

// 👤 קבלת פרטי משתמש (נכון לעכשיו — ללא אימות JWT, נוסיף בהמשך)
router.get("/profile", getProfile);

module.exports = router;
