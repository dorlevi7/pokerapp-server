// server/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for many managed Postgres providers like Neon
    },
});

// Optional: test initial connection on startup
pool
    .connect()
    .then((client) => {
        console.log("✅ Connected to PostgreSQL successfully");
        client.release();
    })
    .catch((err) => {
        console.error("❌ Failed to connect to PostgreSQL:", err.message);
    });

module.exports = pool;
