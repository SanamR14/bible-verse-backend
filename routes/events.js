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

router.get("/:church", authMiddleware, getEventsByChurch);
router.post("/", authMiddleware, createEvent);
router.get("/date/:date", authMiddleware, getEventsByDate);
router.get("/", authMiddleware, getEventsByMonth);
router.put("/update/:id", authMiddleware, updateEvent);
router.delete("/delete/:id", authMiddleware, deleteEvent);

module.exports = router;
