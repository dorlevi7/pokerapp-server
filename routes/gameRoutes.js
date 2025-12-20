const express = require("express");

const {
   createGame,
   getGameSettings,
   getGamePlayers,
   updateGameStatus,
   getGameById
} = require("../controllers/gameController");

const router = express.Router();

/* ============================================================
   🟢 יצירת משחק חדש
============================================================ */
router.post("/create", createGame);

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
   שינוי סטטוס משחק
============================================================ */
router.post("/:gameId/status", updateGameStatus);

module.exports = router;
