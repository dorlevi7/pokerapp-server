// server/routes/clickRoutes.js
const express = require("express");
const { createClick, getClicks } = require("../controllers/clickController");

const router = express.Router();

// POST /api/clicks - Save a new click time
router.post("/", createClick);

// GET /api/clicks - Get recent click times
router.get("/", getClicks);

module.exports = router;
