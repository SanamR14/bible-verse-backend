const pool = require("../db");

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title } = req.body;
    const { userId, email } = req.user;

    const isPublic = email && email.endsWith("@admin.fyi.com");

    const result = await pool.query(
      `INSERT INTO quizzes (title, created_by, is_public)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, userId, isPublic]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create quiz" });
  }
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
      [quiz_id, sessionCode]
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

exports.getPublicQuizzes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title FROM quizzes WHERE is_public = true`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load FYI quizzes" });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { email, score } = req.body; 

    await pool.query(
      `INSERT INTO quiz_scores (quiz_id, user_email, score)
       VALUES ($1, $2, $3)`,
      [quizId, email, score]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const result = await pool.query(
      `SELECT user_email, score
         FROM quiz_scores
        WHERE quiz_id = $1
     ORDER BY score DESC, created_at ASC`,
      [quizId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

