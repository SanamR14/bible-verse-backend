const pool = require("../db");

// Save or update a user's push token
exports.savePushToken = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token)
    return res.status(400).json({ error: "Missing userId or token" });

  try {
    await pool.query(
      `INSERT INTO push_tokens (user_id, push_token)
       VALUES ($1, $2)
       ON CONFLICT (user_id) 
       DO UPDATE SET push_token = EXCLUDED.push_token, updated_at = NOW()`,
      [userId, token]
    );

    res.status(200).json({ success: true, message: "Token saved" });
  } catch (err) {
    console.error("Error saving push token:", err);
    res.status(500).json({ error: "Failed to save token" });
  }
};

// Send push to one user
exports.sendPushToOne = async (req, res) => {
  const { userId, message } = req.body;

  try {
    const result = await pool.query(
      `SELECT push_token FROM push_tokens WHERE user_id = $1`,
      [userId]
    );

    if (!result.rows[0])
      return res.status(404).json({ error: "No token found for user" });

    const payload = {
      to: result.rows[0].push_token,
      sound: "default",
      title: "New Notification",
      body: message,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.status(200).json({ success: true, expo: data });
  } catch (err) {
    console.error("Error sending push:", err);
    res.status(500).json({ error: "Push sending failed" });
  }
};

// Send push to all users
exports.sendPushToAll = async (req, res) => {
  const { message } = req.body;

  try {
    const tokensResult = await pool.query("SELECT push_token FROM push_tokens");
    const tokens = tokensResult.rows.map((r) => r.push_token);

    const payloads = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: "New Announcement",
      body: message,
    }));

    const fetchPromises = payloads.map((p) =>
      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      }).then((r) => r.json())
    );

    const responses = await Promise.all(fetchPromises);
    res.status(200).json({ success: true, expo: responses });
  } catch (err) {
    console.error("Error sending push to all:", err);
    res.status(500).json({ error: "Push sending failed" });
  }
};
