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

const authMiddleware = require("./middleware/auth");

router.post("/",authMiddleware, addSavedItem);
router.get("/:userid",authMiddleware, getUserSavedItems);
router.get("/:userid/:id",authMiddleware, getSavedItem);
router.get("/:item_type/:userid/:item_id",authMiddleware, getSavedItemid);
router.delete("/:item_type/:userid/:item_id",authMiddleware, deleteSavedItem);

module.exports = router;
