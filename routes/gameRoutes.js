const express = require("express");

const {
   createGame,
   getGameSettings,
   getGamePlayers,
   updateGameStatus,
   getGameById,
   addRebuy,
   getGameRebuys,
   getGameRebuyHistory,
} = require("../controllers/gameController");

const router = express.Router();

/* ============================================================
   🟢 יצירת משחק חדש
============================================================ */
router.post("/create", createGame);

/* ============================================================
   🟦 ריבאיי למשחק
   POST /api/games/:gameId/rebuy
============================================================ */
router.post("/:gameId/rebuy", addRebuy);

/* ============================================================
   🟦 ריבאיים של משחק
   GET /api/games/:gameId/rebuys
============================================================ */
router.get("/:gameId/rebuys", getGameRebuys); // 🆕 חדש

/* ============================================================
   🟦 חשוב! מסלולים ספציפיים לפני הכלליים
============================================================ */
router.get("/:gameId/settings", getGameSettings);
router.get("/:gameId/players", getGamePlayers);

/* ============================================================
   🟦 GET /api/games/:gameId
   חייב להיות אחרי המסלולים הספציפיים
============================================================ */
router.get("/:gameId", getGameById);

/* ============================================================
   🔄 שינוי סטטוס משחק
============================================================ */
router.post("/:gameId/status", updateGameStatus);

/* ============================================================
   🟦 היסטוריית ריבאיים (פירוט מלא)
   GET /api/games/:gameId/rebuys/history
============================================================ */
router.get("/:gameId/rebuys/history", getGameRebuyHistory);

module.exports = router;
