const pool = require("../db");

exports.createTestimony = async (req, res) => {
  const { userid, username, prayer, testimony } = req.body;

  if (!userid || !username || !prayer || !testimony) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO testimonies (userid, username, prayer, testimony) VALUES ($1, $2, $3, $4) RETURNING *",
      [userid, username, prayer, testimony]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating testimony:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteTestimony = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM testimonies WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Testimony not found" });
    }

    res.json({ message: "Testimony deleted", testimony: result.rows[0] });
  } catch (err) {
    console.error("Error deleting testimony:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllTestimonies = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM testimonies ORDER BY userid"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTestimoniesByUser = async (req, res) => {
  const { userid } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM testimonies WHERE userid = $1",
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
