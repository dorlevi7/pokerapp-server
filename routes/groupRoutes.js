const express = require("express");
const auth = require("../middleware/auth");

const {
    createGroup,
    getUserGroups,
    getGroupMembers
} = require("../controllers/groupController");

const router = express.Router();

// 🟢 Create a new group  (requires login)
router.post("/create", auth, createGroup);

// 📄 Get groups of logged-in user
router.get("/my-groups", auth, getUserGroups);

// 👥 Get members of a specific group
router.get("/:groupId/members", auth, getGroupMembers);

module.exports = router;
