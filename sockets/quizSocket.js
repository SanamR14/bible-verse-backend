const pool = require("../db");

function quizSocket(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // Join session
    socket.on("join_session", async ({ sessionCode, playerName }) => {
      try {
        socket.join(sessionCode);
        const result = await pool.query(
          "INSERT INTO players (name, session_code) VALUES ($1, $2) RETURNING *",
          [playerName, sessionCode]
        );
        const player = result.rows[0];
        io.to(sessionCode).emit("player_joined", player);
      } catch (err) {
        console.error("join_session error:", err.message);
      }
    });

    // Host starts question
    socket.on("start_question", ({ sessionCode, question }) => {
      console.log("Sending question to session:", sessionCode);
      io.to(sessionCode).emit("question_started", question);
    });

    // Player submits answer
    socket.on(
      "submit_answer",
      async ({ sessionCode, playerId, questionId, selectedOption }) => {
        try {
          const qRes = await pool.query(
            "SELECT correct_answer FROM questions WHERE id=$1",
            [questionId]
          );
          const correctAnswer = qRes.rows[0].correct_answer;
          const isCorrect = correctAnswer === selectedOption;

          if (isCorrect) {
            await pool.query(
              "UPDATE players SET score = score + 10 WHERE id=$1",
              [playerId]
            );
          }

          await pool.query(
            "INSERT INTO answers (player_id, question_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)",
            [playerId, questionId, selectedOption, isCorrect]
          );

          io.to(sessionCode).emit("question_result", {
            playerId,
            correct: isCorrect,
          });

          const res = await pool.query(
            "SELECT id, name, score FROM players WHERE session_code=$1 ORDER BY score DESC",
            [sessionCode]
          );
          io.to(sessionCode).emit("leaderboard", res.rows);
        } catch (err) {
          console.error("submit_answer error:", err.message);
        }
      }
    );

    socket.on("get_leaderboard", async ({ sessionCode }) => {
      try {
        const res = await pool.query(
          "SELECT id, name, score FROM players WHERE session_code=$1 ORDER BY score DESC",
          [sessionCode]
        );
        io.to(sessionCode).emit("leaderboard", res.rows);
      } catch (err) {
        console.error("get_leaderboard error:", err.message);
      }
    });

    socket.on("end_quiz", ({ sessionCode }) => {
      io.to(sessionCode).emit("quiz_ended");
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  });
}

module.exports = quizSocket;
