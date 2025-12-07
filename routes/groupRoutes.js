// server/routes/groupRoutes.js
const express = require("express");

const {
    createGroup,
    getUserGroups,
    getGroupMembers
} = require("../controllers/groupController");

const router = express.Router();

// 🟢 Create a new group — NO AUTH REQUIRED
router.post("/create", createGroup);

// 📄 Get groups of logged-in user — TEMP: will return empty until JWT added
router.get("/my-groups", getUserGroups);

// 👥 Get members of a specific group
router.get("/:groupId/members", getGroupMembers);

module.exports = router;
