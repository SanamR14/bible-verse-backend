const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.post("/", quizController.createQuiz);
router.post("/:quiz_id/questions", quizController.addQuestion);
router.post("/:quiz_id/session", quizController.createSession);
router.get("/:quiz_id/questions", quizController.getQuestions);
router.get("/all", quizController.getAllQuizzes);
router.delete("/delete/:quizId", quizController.deleteQuiz);

module.exports = router;
