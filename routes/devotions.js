const express = require("express");
const router = express.Router();
const controller = require("../controllers/devotionsController");

const authMiddleware = require("./middleware/auth");

router.post("/", controller.createDevotions);

router.get("/", authMiddleware, controller.getAllDevotions);
router.put("/:id", authMiddleware, controller.updateDevotions);
router.delete("/:id", authMiddleware, controller.deleteDevotions);

module.exports = router;
