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
router.get("/:userid/:item_id", getSavedItem);
router.delete("/:userid/:id", deleteSavedItem);

module.exports = router;
