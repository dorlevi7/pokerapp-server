// server/controllers/groupController.js
const groupService = require("../services/groupService");

// 🟢 POST /api/groups/create
async function createGroup(req, res) {
    try {
        const { name, memberIds, ownerId } = req.body;   // 👈 ownerId מגיע מה-client

        if (!name || !Array.isArray(memberIds) || !ownerId) {
            return res
                .status(400)
                .json({ success: false, error: "name, ownerId and memberIds are required" });
        }

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
        const { userId } = req.body; // 👈 זמני עד JWT

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "userId is required until JWT is implemented",
            });
        }

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
