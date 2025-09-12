const pool = require("../db");
function quizSocket(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);
    // Join session
    socket.on("join_session", async ({ sessionCode, playerName }) => {
      try {
        console.log(
          `[join_session] socket=${socket.id} session=${sessionCode} name=${playerName}`
        );
        // insert player into DB
        const result = await pool.query(
          "INSERT INTO players (name, session_code) VALUES ($1, $2) RETURNING *",
          [playerName, sessionCode]
        );
        const player = result.rows[0];
        // send confirmation back only to the joining socket
        socket.emit("joined", player);
        // notify everyone else in the session room
        socket.broadcast.to(sessionCode).emit("player_joined", player);
        // join the socket to the room so it also receives future room broadcasts
        socket.join(sessionCode);
        console.log(
          `[join_session] player id=${player.id} inserted and joined room`
        );
      } catch (err) {
        console.error("join_session error:", err);
        socket.emit("quiz_error", "Failed to join session");
      }
    });

    // Host starts question
    socket.on("start_question", ({ sessionCode, question }) => {
      console.log(
        `[start_question] from socket=${socket.id} session=${sessionCode} qid=${question.id}`
      );
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
        io.to(sessionCode).emit(
          "leaderboard",
          res.rows.filter((p) => p.name !== "HOST")
        );
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
