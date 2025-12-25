const pool = require("../db");

/* ============================================================
   🟢 Create a new game
============================================================ */
async function createGame({ groupId, createdBy, settings, playerIds }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /* 1️⃣ Create game */
        const gameResult = await client.query(
            `
            INSERT INTO games (group_id, created_by, game_type, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING id
            `,
            [groupId, createdBy, settings.gameType]
        );

        const gameId = gameResult.rows[0].id;

        /* 2️⃣ Save settings */
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

        /* 3️⃣ Save players */
        for (const userId of playerIds) {
            await client.query(
                `
                INSERT INTO game_players (game_id, user_id, starting_stack)
                VALUES ($1, $2, $3)
                `,
                [gameId, userId, settings.startingChips || null]
            );
        }

        await client.query("COMMIT");
        return { gameId };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

/* ============================================================
   📄 Get game settings
============================================================ */
async function getGameSettings(gameId) {
    const result = await pool.query(
        `SELECT * FROM game_settings WHERE game_id = $1`,
        [gameId]
    );
    return result.rows[0] || null;
}

/* ============================================================
   👥 Get game players
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
   🔄 Update game status
============================================================ */
async function updateGameStatus(gameId, status) {
    const allowed = ["pending", "active", "finished"];
    if (!allowed.includes(status)) {
        throw new Error("Invalid game status");
    }

    if (status === "active") {
        const result = await pool.query(
            `
            UPDATE games
            SET status = 'active',
                started_at = NOW(),
                finished_at = NULL,
                duration_seconds = NULL
            WHERE id = $1
            RETURNING *
            `,
            [gameId]
        );
        return result.rows[0];
    }

    if (status === "finished") {
        const result = await pool.query(
            `
            UPDATE games
            SET status = 'finished',
                finished_at = NOW(),
                duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
            WHERE id = $1
            RETURNING *
            `,
            [gameId]
        );
        return result.rows[0];
    }
}

/* ============================================================
   📄 Get full game (players + settings)
============================================================ */
/* ============================================================
   📄 Get full game (players + settings + rebuys)
============================================================ */
async function getGameById(gameId) {

    /* ============================================================
       1️⃣ Game + settings + timing fields
    ============================================================ */
    const gameResult = await pool.query(
        `
        SELECT 
            g.id,
            g.group_id,
            g.created_by,
            g.game_type,
            g.status,
            g.created_at,

            -- ⭐ TIMER FIELDS (CRITICAL)
            g.started_at,
            g.finished_at,
            g.duration_seconds,

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
                'notes', gs.notes
            ) AS settings
        FROM games g
        LEFT JOIN game_settings gs ON gs.game_id = g.id
        WHERE g.id = $1
        `,
        [gameId]
    );

    if (gameResult.rows.length === 0) {
        console.log("❌ Game not found:", gameId);
        return null;
    }

    /* ============================================================
       2️⃣ Players
    ============================================================ */
    const playersResult = await pool.query(
        `
        SELECT 
            u.id,
            u.username,
            u.first_name AS "firstName",
            u.last_name AS "lastName"
        FROM game_players gp
        JOIN users u ON u.id = gp.user_id
        WHERE gp.game_id = $1
        ORDER BY u.username
        `,
        [gameId]
    );

    /* ============================================================
       3️⃣ Rebuys (aggregated per player)
    ============================================================ */
    const rebuysResult = await pool.query(
        `
        SELECT 
            user_id,
            COUNT(*)::int AS count,
            COALESCE(SUM(amount), 0)::int AS total
        FROM game_rebuys
        WHERE game_id = $1
        GROUP BY user_id
        `,
        [gameId]
    );

    /* ============================================================
       4️⃣ Final response
    ============================================================ */
    return {
        ...gameResult.rows[0],
        players: playersResult.rows,
        rebuys: rebuysResult.rows
    };
}

/* ============================================================
   💰 Add rebuy
============================================================ */
async function addRebuy({ gameId, userId, amount }) {
    const result = await pool.query(
        `
        INSERT INTO game_rebuys (game_id, user_id, amount)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [gameId, userId, amount]
    );
    return result.rows[0];
}

/* ============================================================
   💰 Get rebuys (aggregated per player)
============================================================ */
async function getGameRebuys(gameId) {
    const result = await pool.query(
        `
        SELECT 
            user_id,
            COUNT(*) AS rebuy_count,
            SUM(amount) AS total_amount
        FROM game_rebuys
        WHERE game_id = $1
        GROUP BY user_id
        `,
        [gameId]
    );

    return result.rows;
}

/* ============================================================
   📜 Get rebuy history (detailed)
============================================================ */
async function getGameRebuyHistory(gameId) {
    const result = await pool.query(
        `
        SELECT
            gr.id,
            gr.user_id,
            u.username,
            gr.amount,
            gr.created_at,
            EXTRACT(EPOCH FROM (gr.created_at - g.started_at))::int
                AS seconds_from_start
        FROM game_rebuys gr
        JOIN users u ON u.id = gr.user_id
        JOIN games g ON g.id = gr.game_id
        WHERE gr.game_id = $1
        ORDER BY gr.created_at ASC
        `,
        [gameId]
    );

    return result.rows;
}

/* ============================================================
   🏁 Finish game + save final results
============================================================ */
async function finishGame({ gameId, results, durationSeconds }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /* 1️⃣ Validate game status */
        const gameCheck = await client.query(
            `SELECT status FROM games WHERE id = $1`,
            [gameId]
        );

        if (gameCheck.rows.length === 0) {
            throw new Error("Game not found");
        }

        if (gameCheck.rows[0].status === "finished") {
            throw new Error("Game already finished");
        }

        /* 2️⃣ Insert final results */
        for (const r of results) {
            await client.query(
                `
                INSERT INTO game_results (
                    game_id,
                    user_id,
                    money_in,
                    money_out,
                    profit
                )
                VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    gameId,
                    r.userId,
                    r.moneyIn,
                    r.moneyOut,
                    r.profit
                ]
            );
        }

        /* 3️⃣ Finalize game */
        await client.query(
            `
            UPDATE games
            SET status = 'finished',
                finished_at = NOW(),
                duration_seconds = $2
            WHERE id = $1
            `,
            [gameId, durationSeconds]
        );

        await client.query("COMMIT");
        return { success: true };

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

/* ============================================================
   📊 Get final game results
============================================================ */
async function getGameResults(gameId) {
    const result = await pool.query(
        `
        SELECT
            gr.user_id,
            u.username,
            gr.money_in,
            gr.money_out,
            gr.profit
        FROM game_results gr
        JOIN users u ON u.id = gr.user_id
        WHERE gr.game_id = $1
        ORDER BY gr.profit DESC
        `,
        [gameId]
    );

    return result.rows;
}

module.exports = {
    createGame,
    getGameSettings,
    getGamePlayers,
    updateGameStatus,
    getGameById,
    addRebuy,
    getGameRebuys,
    getGameRebuyHistory,
    finishGame,
    getGameResults,
};
