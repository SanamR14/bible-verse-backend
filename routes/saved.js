const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  addSavedItem,
  getUserSavedItems,
  getSavedItem,
  getSavedItemid,
  deleteSavedItem,
} = require("../controllers/savedController");

router.post("/", addSavedItem);
router.get("/:userid", getUserSavedItems);
router.get("/:userid/:id", getSavedItem);
router.get("/:item_type/:userid/:item_id", getSavedItemid);
router.delete("/:item_type/:userid/:item_id", deleteSavedItem);

module.exports = router;
