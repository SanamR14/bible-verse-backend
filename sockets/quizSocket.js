const pool = require("../db");
function quizSocket(io) {
  const sessionAnswers = {}; // { sessionCode: { questionId: Set(playerIds) } }

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_session", async ({ sessionCode, playerName }) => {
      try {
        const result = await pool.query(
          "INSERT INTO players (name, session_code) VALUES ($1, $2) RETURNING *",
          [playerName, sessionCode]
        );
        const player = result.rows[0];
        socket.emit("joined", player);
        socket.broadcast.to(sessionCode).emit("player_joined", player);
        socket.join(sessionCode);
      } catch (err) {
        console.error("join_session error:", err);
        socket.emit("quiz_error", "Failed to join session");
      }
    });

    socket.on("start_question", ({ sessionCode, question }) => {
      if (!sessionAnswers[sessionCode]) sessionAnswers[sessionCode] = {};
      sessionAnswers[sessionCode][question.id] = new Set(); // reset answers for this question
      io.to(sessionCode).emit("question_started", question);
    });

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
              "UPDATE players SET score = score + 100 WHERE id=$1",
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

          // Track player answers
          if (!sessionAnswers[sessionCode]) sessionAnswers[sessionCode] = {};
          if (!sessionAnswers[sessionCode][questionId])
            sessionAnswers[sessionCode][questionId] = new Set();
          sessionAnswers[sessionCode][questionId].add(playerId);

          // Check if all players (excluding HOST) answered
          const playersRes = await pool.query(
            "SELECT id FROM players WHERE session_code=$1 AND name <> 'HOST'",
            [sessionCode]
          );
          const totalPlayers = playersRes.rows.length;
          const answeredCount = sessionAnswers[sessionCode][questionId].size;

          if (answeredCount >= totalPlayers) {
            io.to(sessionCode).emit("all_answered", { questionId });
          }

          const leaderboard = await pool.query(
            "SELECT id, name, score FROM players WHERE session_code=$1 ORDER BY score DESC",
            [sessionCode]
          );
          io.to(sessionCode).emit(
            "leaderboard",
            leaderboard.rows.filter((p) => p.name !== "HOST")
          );
        } catch (err) {
          console.error("submit_answer error:", err.message);
        }
      }
    );

    socket.on("end_quiz", ({ sessionCode }) => {
      io.to(sessionCode).emit("quiz_ended");
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  });
}

module.exports = quizSocket;
