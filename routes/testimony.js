const express = require("express");
const router = express.Router();
const {
  createTestimony,
  deleteTestimony,
} = require("../controllers/testimonyController");

router.post("/", createTestimony);

router.delete("/:id", deleteTestimony);

module.exports = router;
