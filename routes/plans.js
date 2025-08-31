const express = require("express");
const router = express.Router();
const plansController = require("../controllers/plansController");

const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, plansController.getAllPlans);
router.put("/:id", authMiddleware, plansController.updatePlan);
router.delete("/:id", authMiddleware, plansController.deletePlan);

router.post("/", plansController.createPlan);
module.exports = router;
