const express = require("express");
const router = express.Router();

const { getEvents, createEvent } = require("../controllers/eventsController");

const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getEvents);
router.post("/", authMiddleware, createEvent);

module.exports = router;
