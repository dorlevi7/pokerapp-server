// server/services/userService.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // 🔐 חובה להחליף בהמשך

// 🧠 יצירת משתמש חדש (Signup)
async function createUser({ firstName, lastName, username, email, password }) {
    try {
        // בדיקה אם האימייל או שם המשתמש כבר קיימים
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (existingUser.rows.length > 0) {
            throw new Error("Email or username already exists");
        }

        // הצפנת הסיסמה
        const hashedPassword = await bcrypt.hash(password, 10);

        // שמירה לטבלה
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

// 🔑 התחברות משתמש (Login)
async function authenticateUser(email, password) {
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return null;

        const user = result.rows[0];

        // ❗ השוואה מול password_hash במקום password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        // יצירת JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "2h",
        });

        return token;
    } catch (error) {
        console.error("❌ Error authenticating user:", error);
        throw error;
    }
}

// 👤 שליפת פרופיל משתמש לפי ID
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
