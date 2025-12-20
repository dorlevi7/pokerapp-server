// server/services/gameService.js
const pool = require("../db");

/* ============================================================
   🟢 Create a new game  
   מקבל settings כאובייקט אחד — בדיוק כמו שהלקוח שולח
   ============================================================ */
async function createGame({ groupId, createdBy, settings, playerIds }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /* --------------------------------------------------------
           1️⃣ יצירת רשומה בטבלת games
        -------------------------------------------------------- */
        const gameResult = await client.query(
            `
            INSERT INTO games (group_id, created_by, game_type, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING id
            `,
            [groupId, createdBy, settings.gameType]
        );

        const gameId = gameResult.rows[0].id;

        /* --------------------------------------------------------
           2️⃣ שמירת קונפיגורציה בטבלת game_settings
        -------------------------------------------------------- */
        await client.query(
            `
            INSERT INTO game_settings (
                game_id,
                currency, buy_in,
                cash_sb, cash_bb,
                allow_rebuy, rebuy_type, min_rebuy, max_rebuy,
                rebuy_percent, max_rebuys_allowed,
                starting_chips, level_duration,
                starting_sb, starting_bb,
                enable_late_reg, late_reg_type, late_reg_minutes, late_reg_level,
                allow_straddle, allow_run_it_twice,
                notes
            )
            VALUES (
                $1,
                $2, $3,
                $4, $5,
                $6, $7, $8, $9,
                $10, $11,
                $12, $13,
                $14, $15,
                $16, $17, $18, $19,
                $20, $21,
                $22
            )
            `,
            [
                gameId,
                settings.currency,
                settings.buyIn,

                settings.cashSB || null,
                settings.cashBB || null,

                settings.allowRebuy,
                settings.rebuyType,
                settings.minRebuy || null,
                settings.maxRebuy || null,

                settings.rebuyPercent || null,
                settings.maxRebuysAllowed || null,

                settings.startingChips || null,
                settings.levelDuration || null,

                settings.startingSB || null,
                settings.startingBB || null,

                settings.enableLateReg,
                settings.lateRegType || null,
                settings.lateRegMinutes || null,
                settings.lateRegLevel || null,

                settings.allowStraddle || false,
                settings.allowRunItTwice || false,

                settings.notes || ""
            ]
        );

        /* --------------------------------------------------------
           3️⃣ שמירת שחקנים בטבלת game_players
        -------------------------------------------------------- */
        for (const userId of playerIds) {
            await client.query(
                `
                INSERT INTO game_players (game_id, user_id, starting_stack)
                VALUES ($1, $2, $3)
                `,
                [
                    gameId,
                    userId,
                    settings.startingChips || null
                ]
            );
        }

        await client.query("COMMIT");

        return { gameId };
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error creating game:", error);
        throw error;
    } finally {
        client.release();
    }
}

/* ============================================================
   📄 קבלת קונפיגורציה
   ============================================================ */
async function getGameSettings(gameId) {
    const result = await pool.query(
        `
        SELECT *
        FROM game_settings
        WHERE game_id = $1
        `,
        [gameId]
    );

    return result.rows[0] || null;
}

/* ============================================================
   👥 קבלת שחקני המשחק
   ============================================================ */
async function getGamePlayers(gameId) {
    const result = await pool.query(
        `
        SELECT gp.user_id, u.username, u.first_name, u.last_name
        FROM game_players gp
        JOIN users u ON u.id = gp.user_id
        WHERE gp.game_id = $1
        ORDER BY u.username
        `,
        [gameId]
    );

    return result.rows;
}

/* ============================================================
   🔄 עדכון סטטוס משחק
   ============================================================ */
async function updateGameStatus(gameId, status) {
    const allowed = ["pending", "active", "finished"];
    if (!allowed.includes(status)) {
        throw new Error("Invalid game status");
    }

    const result = await pool.query(
        `
        UPDATE games
        SET status = $2
        WHERE id = $1
        RETURNING id, status
        `,
        [gameId, status]
    );

    return result.rows[0];
}

async function getGameById(gameId) {
    const query = `
        SELECT 
            g.id,
            g.group_id,
            g.created_by,
            g.game_type,
            g.status,
            g.created_at,

            json_build_object(
                'gameType', g.game_type,
                'currency', gs.currency,
                'buyIn', gs.buy_in,
                'cashSB', gs.cash_sb,
                'cashBB', gs.cash_bb,
                'allowRebuy', gs.allow_rebuy,
                'rebuyType', gs.rebuy_type,
                'minRebuy', gs.min_rebuy,
                'maxRebuy', gs.max_rebuy,
                'rebuyPercent', gs.rebuy_percent,
                'maxRebuysAllowed', gs.max_rebuys_allowed,
                'startingChips', gs.starting_chips,
                'levelDuration', gs.level_duration,
                'startingSB', gs.starting_sb,
                'startingBB', gs.starting_bb,
                'enableLateReg', gs.enable_late_reg,
                'lateRegType', gs.late_reg_type,
                'lateRegMinutes', gs.late_reg_minutes,
                'lateRegLevel', gs.late_reg_level,
                'allowStraddle', gs.allow_straddle,
                'allowRunItTwice', gs.allow_run_it_twice,
                'notes', gs.notes
            ) AS settings,

            COALESCE(
                json_agg(
                    json_build_object(
                        'id', u.id,
                        'username', u.username,
                        'firstName', u.first_name,
                        'lastName', u.last_name
                    )
                ) FILTER (WHERE u.id IS NOT NULL),
                '[]'
            ) AS players

        FROM games g
        LEFT JOIN game_settings gs ON gs.game_id = g.id
        LEFT JOIN game_players gp ON gp.game_id = g.id
        LEFT JOIN users u ON u.id = gp.user_id
        WHERE g.id = $1
        GROUP BY g.id, gs.id
    `;

    const result = await pool.query(query, [gameId]);
    return result.rows[0] || null;
}

module.exports = {
    createGame,
    getGameSettings,
    getGamePlayers,
    updateGameStatus,
    getGameById,
};
