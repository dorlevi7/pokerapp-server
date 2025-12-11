const pool = require("../db");

// 🟢 Create a new group
async function createGroup({ name, ownerId, memberIds = [] }) {
    if (!ownerId) {
        throw new Error("ownerId is required when creating a group");
    }

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
            [name, ownerId]
        );

        const group = groupResult.rows[0];

        // 2️⃣ Ensure owner is in the members list
        if (!memberIds.includes(ownerId)) {
            memberIds.push(ownerId);
        }

        // 3️⃣ Insert group members
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
        if (!userId) return [];

        const result = await pool.query(
            `
            SELECT DISTINCT 
                g.id, 
                g.name,
                g.owner_id,
                u.username AS owner_username,
                u.first_name AS owner_first_name,
                u.last_name AS owner_last_name,
                g.created_at
            FROM groups g
            LEFT JOIN group_members gm ON gm.group_id = g.id
            LEFT JOIN users u ON u.id = g.owner_id   -- ⭐ מוסיף מידע על הבעלים
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
    getGroupsForUser: getGroupsByUser,  // ⭐ הפונקציה שה-controller מצפה לה
    getGroupMembers,
};
