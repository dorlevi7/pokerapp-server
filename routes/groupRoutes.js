// server/routes/groupRoutes.js
const express = require("express");

const {
    createGroup,
    getUserGroups,
    getGroupMembers,
    joinGroup,
    getGroupGames        // 🆕 נוסיף
} = require("../controllers/groupController");

const router = express.Router();

// 🟢 Create a new group
router.post("/create", createGroup);

// 📄 Get groups of logged-in user
router.post("/my-groups", getUserGroups);

// 👥 Get members of a specific group
router.get("/:groupId/members", getGroupMembers);

// 🎮 NEW: Get all games of a group
router.get("/:groupId/games", getGroupGames);   // 🆕

// 🟢 Player accepts invitation
router.post("/:groupId/join", joinGroup);

module.exports = router;
