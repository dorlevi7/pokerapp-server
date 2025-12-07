const groupService = require("../services/groupService");
const pool = require("../db");

// 🟢 POST /api/groups/create
// Create a new group
async function createGroup(req, res) {
    try {
        const { name, members } = req.body;
        const ownerId = req.user.id; // Will work once JWT middleware is added

        if (!name || !members || !Array.isArray(members)) {
            return res
                .status(400)
                .json({ success: false, error: "Group name and members are required" });
        }

        // Create the group
        const group = await groupService.createGroup({ name, ownerId });

        // Add group members
        await groupService.addMembers(group.id, members);

        res.status(201).json({
            success: true,
            data: {
                group,
                members,
            },
        });
    } catch (error) {
        console.error("❌ Error creating group:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// 📄 GET /api/groups/my-groups
// Get all groups that the user owns or is a member of
async function getUserGroups(req, res) {
    try {
        const userId = req.user.id;

        const groups = await groupService.getGroupsByUser(userId);

        res.json({
            success: true,
            data: groups,
        });
    } catch (error) {
        console.error("❌ Error fetching user groups:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

// 👥 GET /api/groups/:groupId/members
async function getGroupMembers(req, res) {
    try {
        const { groupId } = req.params;

        const members = await groupService.getMembers(groupId);

        res.json({
            success: true,
            data: members,
        });
    } catch (error) {
        console.error("❌ Error fetching group members:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

module.exports = {
    createGroup,
    getUserGroups,
    getGroupMembers,
};
