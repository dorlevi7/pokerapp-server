const express = require("express");

const {
   createGame,
   getGameSettings,
   getGamePlayers,
   updateGameStatus,
   getGameById,
   addRebuy            // 🆕 חדש
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
router.post("/:gameId/rebuy", addRebuy); // 🆕 חדש

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
