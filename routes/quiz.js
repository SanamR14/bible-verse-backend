const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, quizController.createQuiz);
router.post("/:quiz_id/questions", authMiddleware, quizController.addQuestion);
router.post("/:quiz_id/session", authMiddleware, quizController.createSession);
router.get("/:quiz_id/questions", authMiddleware, quizController.getQuestions);
router.get("/all", authMiddleware, quizController.getAllQuizzes);
router.delete("/delete/:quizId", authMiddleware, quizController.deleteQuiz);

module.exports = router;
