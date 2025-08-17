const pool = require('../db');

// GET all
exports.getAllDevotions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM devotions ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST
exports.createDevotions = async (req, res) => {
  const { title, author, message, days, issaved } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO devotions (title, author, message, days, issaved) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, author, message, days, issaved]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
};

// PUT (Update)
exports.updateDevotions = async (req, res) => {
  const { id } = req.params;
  const { title, author, message, days, issaved } = req.body;

  try {
    const result = await pool.query(
      "UPDATE devotions SET title = $1, author = $2, message = $3, days = $4, issaved = $5 WHERE id = $6 RETURNING *",
      [title, author, message, days, issaved, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ error: "Failed to update plan" });
  }
};

// DELETE
exports.deleteDevotions = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM devotions WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
};

