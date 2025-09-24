const express = require("express");
const router = express.Router();

const {
  getRotaByDate,
  createRota,
  updateRota,
  deleteRota,
  getRotaByMonth,
} = require("../controllers/rotaController");

const authMiddleware = require("../middleware/auth");

router.get("/:date", authMiddleware, getRotaByDate);
router.post("/rota", authMiddleware, createRota);
router.put("/update/:id", authMiddleware, updateRota);
router.delete("/:id", authMiddleware, deleteRota);
router.get("/monthrota", authMiddleware, getRotaByMonth);

module.exports = router;
