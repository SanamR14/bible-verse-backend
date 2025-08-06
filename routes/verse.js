const express = require("express");
const router = express.Router();
const {
  getAllVerses,
  postVerse,
  updateVerse,
  deleteVerse,
} = require("../controllers/dailyverseController");

router.get("/", getAllVerses);
router.post("/", postVerse);
router.put("/", updateVerse);
router.delete("/:id", deleteVerse);

module.exports = router;
