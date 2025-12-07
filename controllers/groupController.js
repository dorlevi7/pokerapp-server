// server/controllers/groupController.js
const groupService = require("../services/groupService");

// 🟢 POST /api/groups/create
async function createGroup(req, res) {
    try {
        const { name, memberIds } = req.body;

        if (!name || !Array.isArray(memberIds)) {
            return res
                .status(400)
                .json({ success: false, error: "Group name and memberIds are required" });
        }

        // 🟢 No JWT yet → ownerId = null
        const ownerId = null;

        const group = await groupService.createGroup({
            name,
            ownerId,
            memberIds,
        });

        res.status(201).json({
            success: true,
            data: group,
        });
    } catch (error) {
        console.error("❌ Error creating group:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// 📄 GET /api/groups/my-groups
async function getUserGroups(req, res) {
    try {
        // 🟢 No JWT yet → no userId
        const userId = null;

        const groups = await groupService.getGroupsForUser(userId);

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

        const members = await groupService.getGroupMembers(groupId);

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
