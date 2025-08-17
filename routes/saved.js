const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  addSavedItem,
  getUserSavedItems,
  getSavedItem,
  deleteSavedItem,
} = require("../controllers/savedController");

router.post("/", addSavedItem);
router.get("/:userid", getUserSavedItems);
router.get("/:id", getSavedItem);
router.delete("/:id", deleteSavedItem);

module.exports = router;
