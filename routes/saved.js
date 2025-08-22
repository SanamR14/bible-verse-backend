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
router.get("/:userid/:id", getSavedItem);
router.get("/:userid/:item_id", getSavedItemid);
router.delete("/:item_type/:userid/:item_id", deleteSavedItem);

module.exports = router;
