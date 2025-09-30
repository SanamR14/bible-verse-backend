const pool = require("../db");

// Create new quiz
exports.createQuiz = async (req, res) => {
  const { title } = req.body;
  const { userId } = req.user;
  const result = await pool.query(
    `INSERT INTO quizzes (title, created_by) VALUES ($1, $2) RETURNING *`,
    [title, userId]
  );
  res.json(result.rows[0]);
};

// Add question to quiz
exports.addQuestion = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { question_text, options, correct_answer } = req.body;

    const result = await pool.query(
      `INSERT INTO questions (quiz_id, question_text, options, correct_answer) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [quiz_id, question_text, options, correct_answer]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add question" });
  }
};

// Create quiz session (just generates a session code)
exports.createSession = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const sessionCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    await pool.query(
      `INSERT INTO sessions (quiz_id, session_code) VALUES ($1,$2)`,
      [quizId, sessionCode]
    );
    res.status(201).json({ quiz_id: Number(quiz_id), sessionCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
};

exports.getQuestions = async (req, res) => {
  const { quiz_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM questions WHERE quiz_id=$1",
      [quiz_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Quiz not found" });

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

exports.deleteQuiz = async (req, res) => {
  const { quizId } = req.params;
  await pool.query(`DELETE FROM quizzes WHERE id=$1`, [quizId]);
  res.json({ message: "Quiz deleted" });
};
exports.getAllQuizzes = async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM quizzes ORDER BY created_at DESC`
  );
  res.json(result.rows);
};

// Get quizzes created by the logged-in user
exports.getMyQuizzes = async (req, res) => {
  try {
    // userId is set by auth middleware
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT * FROM quizzes WHERE created_by = $1 ORDER BY id DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user quizzes:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM questions WHERE id=$1`, [id]);
  res.json({ message: "Question deleted" });
};
