// routes/pushRoutes.js
const express = require("express");
const router = express.Router();
const {
  saveToken,
  sendPushToAll,
  sendPushToOne,
} = require("../controllers/pushController");

// Save Expo push token
router.post("/save-token", saveToken);

// Send push notification to ALL
router.post("/push/send-to-all", sendPushToAll);

// Send push to ONE user
router.post("/push/send-to-one", sendPushToOne);

module.exports = router;
