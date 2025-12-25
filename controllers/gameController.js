const gameService = require("../services/gameService");

/* ============================================================
   🟢 POST /api/games/create
============================================================ */
async function createGame(req, res) {
    try {
        const { groupId, createdBy, playerIds, settings } = req.body;

        if (!groupId || !createdBy || !Array.isArray(playerIds)) {
            return res.status(400).json({
                success: false,
                error: "groupId, createdBy, and playerIds are required",
            });
        }

        const game = await gameService.createGame({
            groupId,
            createdBy,
            settings,
            playerIds
        });

        return res.status(201).json({
            success: true,
            data: game,
        });
    } catch (error) {
        console.error("❌ Error creating game:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

/* ============================================================
   📄 GET /api/games/:gameId/settings
============================================================ */
async function getGameSettings(req, res) {
    try {
        const { gameId } = req.params;
        const settings = await gameService.getGameSettings(gameId);

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error("❌ Error fetching game settings:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

/* ============================================================
   👥 GET /api/games/:gameId/players
============================================================ */
async function getGamePlayers(req, res) {
    try {
        const { gameId } = req.params;
        const players = await gameService.getGamePlayers(gameId);

        res.json({ success: true, data: players });
    } catch (error) {
        console.error("❌ Error fetching game players:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

/* ============================================================
   🔄 POST /api/games/:gameId/status
============================================================ */
async function updateGameStatus(req, res) {
    try {
        const { gameId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: "status is required",
            });
        }

        const updated = await gameService.updateGameStatus(gameId, status);

        res.json({
            success: true,
            message: "Game status updated",
            data: updated,
        });
    } catch (error) {
        console.error("❌ Error updating game status:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
}

/* ============================================================
   📄 GET /api/games/:gameId
============================================================ */
async function getGameById(req, res) {
    try {
        const { gameId } = req.params;
        const game = await gameService.getGameById(gameId);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: "Game not found"
            });
        }

        return res.json({
            success: true,
            data: {
                game,
                players: game.players || [],
                rebuys: game.rebuys || []   // ⭐ זה כל הסיפור
            }
        });

    } catch (err) {
        console.error("❌ Error in getGameById:", err);
        return res.status(500).json({
            success: false,
            error: "Server error fetching game"
        });
    }
}

/* ============================================================
   💰 POST /api/games/:gameId/rebuy
============================================================ */
async function addRebuy(req, res) {
    try {
        const { gameId } = req.params;
        const { userId, amount } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                error: "userId and amount are required",
            });
        }

        const rebuy = await gameService.addRebuy({
            gameId,
            userId,
            amount
        });

        return res.status(201).json({
            success: true,
            data: rebuy
        });
    } catch (error) {
        console.error("❌ Error adding rebuy:", error);
        return res.status(500).json({
            success: false,
            error: "Server error adding rebuy"
        });
    }
}

/* ============================================================
   💰 GET /api/games/:gameId/rebuys
   קריאת ריבאיים מה־DB
============================================================ */
async function getGameRebuys(req, res) {
    try {
        const { gameId } = req.params;

        const rebuys = await gameService.getGameRebuys(gameId);

        return res.json({
            success: true,
            data: rebuys
        });
    } catch (error) {
        console.error("❌ Error fetching rebuys:", error);
        return res.status(500).json({
            success: false,
            error: "Server error fetching rebuys"
        });
    }
}

module.exports = {
    createGame,
    getGameSettings,
    getGamePlayers,
    updateGameStatus,
    getGameById,
    addRebuy,
    getGameRebuys,   // 🆕 חשוב!
};
