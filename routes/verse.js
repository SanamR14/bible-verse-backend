const express = require("express");
const router = express.Router();
const {
  getAllVerses,
  postVerse,
  updateVerse,
  updateVerses,
  deleteVerse,
} = require("../controllers/dailyverseController");

router.get("/", getAllVerses);
router.post("/", postVerse);
router.put("/", updateVerse);
router.put("/monthly/", updateVerses);
router.delete("/:id", deleteVerse);

module.exports = router;
