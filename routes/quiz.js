const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.post("/", quizController.createQuiz);
router.post("/:quizId/questions", quizController.addQuestion);
router.post("/:quizId/session", quizController.createSession);
router.get("/quiz/:quizId/questions", quizController.getQuestions);

module.exports = router;
