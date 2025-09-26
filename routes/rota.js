const express = require("express");
const router = express.Router();

const {
  getRotaByDate,
  createRota,
  updateRota,
  deleteRota,
  getRotaByMonth,
  getRotaByMember,
  getAllRota,
} = require("../controllers/rotaController");

const authMiddleware = require("../middleware/auth");

router.get("/:date", authMiddleware, getRotaByDate);
router.post("/rota", authMiddleware, createRota);
router.put("/update/:id", authMiddleware, updateRota);
router.delete("/:id", authMiddleware, deleteRota);
router.get("/monthrota/:month", authMiddleware, getRotaByMonth);
router.get("/member/:memberId", authMiddleware, getRotaByMember);
router.get("/all/:church", authMiddleware, getAllRota);

module.exports = router;
