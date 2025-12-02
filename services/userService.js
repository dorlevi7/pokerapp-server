// server/services/userService.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // 🔐 Must be replaced later

// 🧠 Create a new user (Signup)
async function createUser({ firstName, lastName, username, email, password }) {
    try {
        // Check if the email or username already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (existingUser.rows.length > 0) {
            throw new Error("Email or username already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to the table
        const query = `
      INSERT INTO users (first_name, last_name, username, email, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, username, email, created_at;
    `;
        const values = [firstName, lastName, username, email, hashedPassword];
        const result = await pool.query(query, values);

        return result.rows[0];
    } catch (error) {
        console.error("❌ Error creating user:", error);
        throw error;
    }
}

// 🔑 User login (Login)
async function authenticateUser(email, password) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        // ❗ Compare against password_hash instead of password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        // Create JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "2h",
        });

        return token;
    } catch (error) {
        console.error("❌ Error authenticating user:", error);
        throw error;
    }
}

// 👤 Fetch user profile by ID
async function getUserById(userId) {
    try {
        const result = await pool.query(
            "SELECT id, first_name, last_name, username, email, created_at FROM users WHERE id = $1",
            [userId]
        );
        return result.rows[0];
    } catch (error) {
        console.error("❌ Error getting user by ID:", error);
        throw error;
    }
}

module.exports = {
    createUser,
    authenticateUser,
    getUserById,
};
