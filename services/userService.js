// server/services/userService.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // 🔐 Must be replaced later

// 🧠 Create a new user (Signup)
async function createUser({ firstName, lastName, username, email, password }) {
    try {
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (existingUser.rows.length > 0) {
            throw new Error("Email or username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO users (first_name, last_name, username, email, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, first_name, last_name, username, email, created_at;
            `,
            [firstName, lastName, username, email, hashedPassword]
        );

        return result.rows[0];
    } catch (error) {
        console.error("❌ Error creating user:", error);
        throw error;
    }
}

// 🔑 Authenticate user
async function authenticateUser(email, password) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "2h",
        });

        return token;
    } catch (error) {
        console.error("❌ Error authenticating user:", error);
        throw error;
    }
}

// 👤 Fetch user profile
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

// 🔍 Lookup by email OR username
async function findUserByEmailOrUsername(query) {
    try {
        const result = await pool.query(
            `
            SELECT id, first_name, last_name, username, email
            FROM users
            WHERE email = $1 OR username = $1
            `,
            [query]
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error("❌ Error checking if user exists:", error);
        throw error;
    }
}

// ✏️ Update user information
async function updateUser({ id, firstName, lastName, username, email, password }) {
    try {
        // Check if updating email or username conflicts with another user
        const check = await pool.query(
            `
            SELECT id FROM users
            WHERE (email = $1 OR username = $2) AND id != $3
            `,
            [email, username, id]
        );

        if (check.rows.length > 0) {
            throw new Error("Email or username already taken by another user");
        }

        let hashedPassword = null;

        // Hash password only if updating it
        if (password && password.trim() !== "") {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await pool.query(
            `
            UPDATE users
            SET first_name = $1,
                last_name = $2,
                username = $3,
                email = $4,
                password_hash = COALESCE($5, password_hash)
            WHERE id = $6
            RETURNING id, first_name, last_name, username, email, created_at;
            `,
            [firstName, lastName, username, email, hashedPassword, id]
        );

        return result.rows[0];
    } catch (error) {
        console.error("❌ Error updating user:", error);
        throw error;
    }
}

module.exports = {
    createUser,
    authenticateUser,
    getUserById,
    findUserByEmailOrUsername,
    updateUser, // ⭐ EXPORT NEW FUNCTION
};
