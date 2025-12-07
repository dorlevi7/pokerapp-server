// server/services/groupService.js
const pool = require("../db");

// 🟢 Create a new group
async function createGroup({ name, ownerId, memberIds = [] }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Create group
        const groupResult = await client.query(
            `
            INSERT INTO groups (name, owner_id)
            VALUES ($1, $2)
            RETURNING id, name, owner_id, created_at
            `,
            [name, ownerId] // ownerId may be NULL (allowed)
        );

        const group = groupResult.rows[0];

        // 2️⃣ Insert group members
        if (Array.isArray(memberIds) && memberIds.length > 0) {
            const insertValues = memberIds
                .map((id, idx) => `($1, $${idx + 2})`)
                .join(", ");

            await client.query(
                `
                INSERT INTO group_members (group_id, user_id)
                VALUES ${insertValues}
                `,
                [group.id, ...memberIds]
            );
        }

        await client.query("COMMIT");

        return group;
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error creating group:", error);
        throw error;
    } finally {
        client.release();
    }
}

// 📄 Get all groups for a given user
async function getGroupsByUser(userId) {
    try {
        // If no user ID (because JWT disabled), return empty array
        if (!userId) return [];

        const result = await pool.query(
            `
            SELECT DISTINCT g.id, g.name, g.owner_id, g.created_at
            FROM groups g
            LEFT JOIN group_members gm ON gm.group_id = g.id
            WHERE gm.user_id = $1 OR g.owner_id = $1
            ORDER BY g.created_at DESC
            `,
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching user groups:", error);
        throw error;
    }
}

// 👥 Get members of a specific group
async function getGroupMembers(groupId) {
    try {
        const result = await pool.query(
            `
            SELECT u.id, u.first_name, u.last_name, u.username, u.email
            FROM group_members gm
            JOIN users u ON u.id = gm.user_id
            WHERE gm.group_id = $1
            ORDER BY u.username
            `,
            [groupId]
        );

        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching group members:", error);
        throw error;
    }
}

module.exports = {
    createGroup,
    getGroupsByUser,
    getGroupMembers,
};
