const pool = require("../db");
const QRCode = require("qrcode");

function quizSocket(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_session", async ({ sessionCode, playerName }) => {
      try {
        // Skip host saving as a player
        if (playerName === "HOST") {
          socket.join(sessionCode);
          const qrData = await QRCode.toDataURL(sessionCode);
          io.to(sessionCode).emit("session_qr", { code: sessionCode, qrData });
          return;
        }

        const result = await pool.query(
          "INSERT INTO players (name, session_code, score) VALUES ($1, $2, 0) RETURNING *",
          [playerName, sessionCode]
        );
        const player = result.rows[0];
        socket.emit("joined", player);
        socket.broadcast.to(sessionCode).emit("player_joined", player);
        socket.join(sessionCode);

        const qrData = await QRCode.toDataURL(sessionCode);
        io.to(sessionCode).emit("session_qr", { code: sessionCode, qrData });
      } catch (err) {
        console.error("join_session error:", err);
        socket.emit("quiz_error", "Failed to join session");
      }
    });

    // Start question
    socket.on("start_question", async ({ sessionCode, question, isLast }) => {
      let remaining = 30;
      const startTime = Date.now();
      io.to(sessionCode).emit("question_started", { question, duration: 30 });

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

          if (isLast) io.to(sessionCode).emit("show_final_leaderboard");
        }
      }, 1000);

      // Listen for answer submissions
      socket.on(
        "submit_answer",
        async ({ sessionCode, playerId, questionId, selectedOption }) => {
          try {
            const qRes = await pool.query(
              "SELECT correct_answer FROM questions WHERE id=$1",
              [questionId]
            );
            const correctAnswer = qRes.rows[0].correct_answer;

            const elapsed = (Date.now() - startTime) / 1000; // seconds
            let points = 0;

            if (selectedOption === correctAnswer) {
              // Calculate dynamic points (max 1000, min 500)
              const speedFactor = Math.max(0, (30 - elapsed) / 30);
              points = Math.floor(500 + 500 * speedFactor);
              await pool.query(
                "UPDATE players SET score = score + $1 WHERE id=$2",
                [points, playerId]
              );
            }

            await pool.query(
              "INSERT INTO answers (player_id, question_id, selected_option, is_correct) VALUES ($1,$2,$3,$4)",
              [
                playerId,
                questionId,
                selectedOption,
                selectedOption === correctAnswer,
              ]
            );

            const res = await pool.query(
              "SELECT id,name,score FROM players WHERE session_code=$1 ORDER BY score DESC",
              [sessionCode]
            );
            io.to(sessionCode).emit("leaderboard", res.rows);
          } catch (err) {
            console.error("submit_answer error:", err.message);
          }
        }
      );
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
