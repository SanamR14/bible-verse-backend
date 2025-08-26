const express = require("express");
const router = express.Router();
const {
  createTestimony,
  deleteTestimony,
  getAllTestimonies,
} = require("../controllers/testimonyController");

router.post("/", createTestimony);
router.delete("/:id", deleteTestimony);
router.get("/", getAllTestimonies);

module.exports = router;
