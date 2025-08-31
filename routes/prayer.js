const express = require("express");
const router = express.Router();
require("dotenv").config();

const {
  getAllPrayerRequest,
  getPrayerRequestByUser,
  deletePrayerRequest,
  addPrayerRequest,
} = require("../controllers/prayerController");

const authMiddleware = require("./middleware/auth");

router.get("/allPrayers", authMiddleware, getAllPrayerRequest);
router.get("/:userid", authMiddleware, getPrayerRequestByUser);
router.delete("/:userid/:prayerid", authMiddleware, deletePrayerRequest);
router.post("/prayerReq", authMiddleware, addPrayerRequest);

module.exports = router;
