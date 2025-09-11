const pool = require("../db");
const QRCode = require("qrcode");

function quizSocket(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // Player joins session
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

        // Send QR to all players (host already got it from REST)
        const qrData = await QRCode.toDataURL(sessionCode);
        io.to(sessionCode).emit("session_qr", { code: sessionCode, qrData });
      } catch (err) {
        console.error("join_session error:", err);
        socket.emit("quiz_error", "Failed to join session");
      }
    });

    // Host starts question with countdown
    socket.on("start_question", async ({ sessionCode, question, isLast }) => {
      io.to(sessionCode).emit("question_started", { question, duration: 30 });

      let remaining = 30;
      const timer = setInterval(async () => {
        remaining--;
        io.to(sessionCode).emit("timer_update", { remaining });

        if (remaining <= 0) {
          clearInterval(timer);
          const res = await pool.query(
            "SELECT id, name, score FROM players WHERE session_code=$1 ORDER BY score DESC",
            [sessionCode]
          );
          io.to(sessionCode).emit("leaderboard", res.rows);

          if (isLast) {
            io.to(sessionCode).emit("show_final_leaderboard");
          }
        }
      }, 1000);
    });

    // Handle answer submission
    socket.on(
      "submit_answer",
      async ({ sessionCode, playerId, questionId, selectedOption }) => {
        try {
          // Fetch correct_answer (integer) from DB
          const qRes = await pool.query(
            "SELECT correct_answer FROM questions WHERE id=$1",
            [questionId]
          );
          const correctAnswer = qRes.rows[0].correct_answer; // already an integer
          const isCorrect = parseInt(selectedOption) === correctAnswer; // ✅ compare integers

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

    // Send leaderboard on request
    socket.on("get_leaderboard", async ({ sessionCode }) => {
      const res = await pool.query(
        "SELECT id, name, score FROM players WHERE session_code=$1 ORDER BY score DESC",
        [sessionCode]
      );
      io.to(sessionCode).emit("leaderboard", res.rows);
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
