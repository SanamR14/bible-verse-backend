const express = require("express");
const router = express.Router();
const {
  createTestimony,
  deleteTestimony,
  getAllTestimonies,
} = require("../controllers/testimonyController");

const authMiddleware = require("../middleware/auth");

router.post("/",authMiddleware, createTestimony);
router.delete("/:id",authMiddleware, deleteTestimony);
router.get("/",authMiddleware, getAllTestimonies);

module.exports = router;
