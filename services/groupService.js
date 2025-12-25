const pool = require("../db");

// 🟢 Create a new group
async function createGroup({ name, ownerId, memberIds = [] }) {
    if (!ownerId) {
        throw new Error("ownerId is required when creating a group");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Create group (only owner is auto-added)
        const groupResult = await client.query(
            `
            INSERT INTO groups (name, owner_id)
            VALUES ($1, $2)
            RETURNING id, name, owner_id, created_at
            `,
            [name, ownerId]
        );

        const group = groupResult.rows[0];

        // 2️⃣ Insert only the OWNER as member
        await client.query(
            `
            INSERT INTO group_members (group_id, user_id)
            VALUES ($1, $2)
            `,
            [group.id, ownerId]
        );

        // ⛔️ No memberIds inserted — they must accept invitation first.

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
            LEFT JOIN users u ON u.id = g.owner_id
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

// 🟢 NEW: Add user to group after accepting invitation
async function addUserToGroup(groupId, userId) {
    try {
        // 1️⃣ Check if already a member
        const check = await pool.query(
            `
            SELECT 1 FROM group_members
            WHERE group_id = $1 AND user_id = $2
            `,
            [groupId, userId]
        );

        if (check.rows.length > 0) {
            return { alreadyMember: true };
        }

        // 2️⃣ Insert user into group
        const result = await pool.query(
            `
            INSERT INTO group_members (group_id, user_id)
            VALUES ($1, $2)
            RETURNING group_id, user_id
            `,
            [groupId, userId]
        );

        return result.rows[0];
    } catch (error) {
        console.error("❌ Error adding user to group:", error);
        throw error;
    }
}

// 🎮 Get all games for a specific group
async function getGroupGames(groupId) {
    try {
        const result = await pool.query(
            `
SELECT
    id,
    group_id,
    game_type,
    status,
    created_at,
    started_at,
    finished_at,
    duration_seconds,

    ROW_NUMBER() OVER (
        PARTITION BY group_id
        ORDER BY created_at ASC
    ) AS game_number

FROM games
WHERE group_id = $1
ORDER BY created_at DESC

            `,
            [groupId]
        );

        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching group games:", error);
        throw error;
    }
}

module.exports = {
    createGroup,
    getGroupsByUser,
    getGroupsForUser: getGroupsByUser,
    getGroupMembers,
    addUserToGroup,
    getGroupGames,
};
