// controllers/pushController.js
const pool = require("../db");

// Save Expo push token
exports.saveToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Push token is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expo_push_tokens (token) 
       VALUES ($1)
       ON CONFLICT (token) DO NOTHING
       RETURNING *`,
      [token]
    );

    return res.status(200).json({
      success: true,
      message: "Token saved",
      data: result.rows[0] || { token },
    });
  } catch (err) {
    console.error("Error saving push token:", err.message);
    res.status(500).json({ error: "Failed to save token" });
  }
};

// Send notification to ALL saved tokens
exports.sendPushToAll = async (req, res) => {
  const { message, title = "📢 Notification" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  try {
    const result = await pool.query(
      "SELECT token FROM expo_push_tokens"
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No push tokens stored",
      });
    }

    const tokens = result.rows.map((row) => row.token);

    const expoMessages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: title,
      body: message,
      data: { message },
    }));

    // Send to Expo push service
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expoMessages),
    });

    res.status(200).json({
      success: true,
      sent: tokens.length,
      message: "Notifications sent",
    });
  } catch (err) {
    console.error("Error sending notifications:", err.message);
    res.status(500).json({ error: "Failed to send notifications" });
  }
};

// Send push to a SINGLE token
exports.sendPushToOne = async (req, res) => {
  const { token, message, title = "📢 Notification" } = req.body;

  if (!token || !message) {
    return res.status(400).json({ error: "Token & message required" });
  }

  try {
    const payload = {
      to: token,
      sound: "default",
      title,
      body: message,
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([payload]),
    });

    res.status(200).json({
      success: true,
      message: "Notification sent",
    });
  } catch (err) {
    console.error("Error sending push to single user:", err.message);
    res.status(500).json({ error: "Failed to send push notification" });
  }
};
