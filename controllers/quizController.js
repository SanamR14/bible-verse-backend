const pool = require("../db");

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      "INSERT INTO quizzes (title) VALUES ($1) RETURNING *",
      [title]
    );
    res.status(201).json(result.rows[0]);
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
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};
