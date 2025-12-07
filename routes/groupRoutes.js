// server/routes/groupRoutes.js
const express = require("express");
const {
    createGroup,
    getUserGroups,
    getGroupMembers
} = require("../controllers/groupController");

const router = express.Router();

// 🟢 Create a new group
router.post("/create", createGroup);

// 📄 Get all groups of the logged-in user
router.get("/my-groups", getUserGroups);

// 👥 Get members of a specific group
router.get("/:groupId/members", getGroupMembers);

module.exports = router;
