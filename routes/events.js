const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEventsByChurch,
  getEventsByDate,
  getEventsByMonth,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventsController");

const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getEventsByChurch);
router.post("/", authMiddleware, createEvent);
router.get("/eventdate", authMiddleware, getEventsByDate);
router.get("/eventmonth", authMiddleware, getEventsByMonth);
router.put("/updateevent", authMiddleware, updateEvent);
router.delete("/deleteevent", authMiddleware, deleteEvent);

module.exports = router;
