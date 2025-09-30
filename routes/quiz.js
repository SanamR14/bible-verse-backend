const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, quizController.createQuiz);
router.post("/:quiz_id/questions", quizController.addQuestion);
router.post("/:quiz_id/session", quizController.createSession);
router.get("/:quiz_id/questions", quizController.getQuestions);
router.get("/all", quizController.getAllQuizzes);
router.delete("/delete/:quizId", quizController.deleteQuiz);
router.get("/my", authMiddleware, quizController.getMyQuizzes);
router.delete("/questions/:id", quizController.deleteQuestion);
app.get("/public", quizController.getPublicQuizzes);
app.post("/:quizId/score", quizController.submitScore);
app.get("/:quizId/leaderboard", quizController.getLeaderboard);

module.exports = router;
