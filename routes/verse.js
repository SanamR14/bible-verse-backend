const express = require("express");
const router = express.Router();
const {
  getDailyVerse,
  getAllVerses,
  postVerse,
  updateVerse,
  updateVerses,
  deleteVerse,
} = require("../controllers/dailyverseController");

const authMiddleware = require("../middleware/auth");

router.get("/daily", authMiddleware, getDailyVerse);
router.get("/", authMiddleware, getAllVerses);
router.put("/", authMiddleware, updateVerse);
router.put("/monthly/", authMiddleware, updateVerses);
router.delete("/:id", authMiddleware, deleteVerse);

router.post("/", postVerse);

module.exports = router;
