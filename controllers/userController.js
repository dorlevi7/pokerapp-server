// server/controllers/userController.js
const userService = require("../services/userService");

// 🧠 POST /api/users/signup
async function signup(req, res) {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        const user = await userService.createUser({
            firstName,
            lastName,
            username,
            email,
            password,
        });

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error("❌ Error in signup:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

// 🔑 POST /api/users/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const token = await userService.authenticateUser(email, password);
        if (!token)
            return res
                .status(401)
                .json({ success: false, error: "Invalid email or password" });

        res.json({ success: true, token });
    } catch (error) {
        console.error("❌ Error in login:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

// 👤 GET /api/users/profile
async function getProfile(req, res) {
    try {
        const user = await userService.getUserById(req.user.id);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch profile" });
    }
}

module.exports = { signup, login, getProfile };
