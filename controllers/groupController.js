const groupService = require("../services/groupService");

// 🟢 POST /api/groups/create
async function createGroup(req, res) {
    try {
        const { name, memberIds } = req.body;
        const ownerId = req.user?.id || null; // JWT later

        if (!name || !Array.isArray(memberIds)) {
            return res
                .status(400)
                .json({ success: false, error: "Group name and memberIds are required" });
        }

        const group = await groupService.createGroup({
            name,
            ownerId,
            memberIds, // 👈 חובה!!
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
        const userId = req.user?.id || null;

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
