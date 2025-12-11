// server/routes/groupRoutes.js
const express = require("express");

const {
    createGroup,
    getUserGroups,
    getGroupMembers,
    joinGroup,          // ⭐ נוסיף עוד רגע בקונטרולר
} = require("../controllers/groupController");

const router = express.Router();

// 🟢 Create a new group — NO AUTH REQUIRED
router.post("/create", createGroup);

// 📄 Get groups of logged-in user — TEMP: now works with POST
router.post("/my-groups", getUserGroups);

// 👥 Get members of a specific group
router.get("/:groupId/members", getGroupMembers);

// 🟢 NEW: Player accepts invitation → joins the group
router.post("/:groupId/join", joinGroup);   // ⭐ חדש

module.exports = router;
