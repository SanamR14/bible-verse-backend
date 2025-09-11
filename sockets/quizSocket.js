const pool = require("../db");
const QRCode = require("qrcode");

function quizSocket(io) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_session", async ({ sessionCode, playerName }) => {
      try {
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

    const activeQuestions = new Map();

    socket.on("start_question", async ({ sessionCode, question, isLast }) => {
      const playersRes = await pool.query(
        "SELECT COUNT(*) FROM players WHERE session_code=$1",
        [sessionCode]
      );
      const totalPlayers = parseInt(playersRes.rows[0].count);

      activeQuestions.set(sessionCode, {
        startTime: Date.now(),
        answered: new Set(),
        totalPlayers,
        isLast,
      });

      io.to(sessionCode).emit("question_started", { question, duration: 30 });
    });

    socket.on(
      "submit_answer",
      async ({ sessionCode, playerId, questionId, selectedOption }) => {
        try {
          const session = activeQuestions.get(sessionCode);
          if (!session) return;

          const { startTime, answered, totalPlayers, isLast } = session;

          const qRes = await pool.query(
            "SELECT correct_answer FROM questions WHERE id=$1",
            [questionId]
          );
          const correctAnswer = qRes.rows[0].correct_answer;

          const elapsed = (Date.now() - startTime) / 1000;
          let points = 0;

          if (selectedOption === correctAnswer) {
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

          answered.add(playerId);

          const res = await pool.query(
            "SELECT id,name,score FROM players WHERE session_code=$1 ORDER BY score DESC",
            [sessionCode]
          );
          io.to(sessionCode).emit(
            "leaderboard",
            res.rows.filter((p) => p.name !== "HOST")
          );

          if (answered.size === totalPlayers) {
            if (isLast) {
              io.to(sessionCode).emit("show_final_leaderboard");
            } else {
              io.to(sessionCode).emit("ready_for_next_question");
            }
          }
        } catch (err) {
          console.error("submit_answer error:", err.message);
        }
      }
    );

    // These listeners must also be INSIDE the connection block
    socket.on("end_quiz", ({ sessionCode }) => {
      io.to(sessionCode).emit("quiz_ended");
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  });
}

module.exports = quizSocket;
