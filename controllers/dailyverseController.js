const pool = require("../db");

// GET all verses
exports.getAllVerses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM verse");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST new verse
exports.postVerse = async (req, res) => {
  const { verse, reference } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO verse (verse, public_id, image_url) VALUES ($1, $2, $3) RETURNING *",
      [verse, public_id, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create verse" });
  }
};

// PUT update verse
exports.updateVerse = async (req, res) => {
  const { id, verse, reference } = req.body;
  try {
    const result = await pool.query(
      "UPDATE verse SET verse = $1, public_id = $2 WHERE id = $3 RETURNING *",
      [verse, public_id, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update verse" });
  }
};

// DELETE verse
exports.deleteVerse = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM verse WHERE id = $1", [id]);
    res.status(200).json({ message: "Verse deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to delete verse" });
  }
};
