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
  const { verse, public_id, image_url } = req.body;
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
  const { id, verse, public_id, image_url } = req.body;
  try {
    const result = await pool.query(
      "UPDATE verse SET verse = $1, public_id = $2, image_url = $3 WHERE id = $4 RETURNING *",
      [verse, public_id, image_url, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update verse" });
  }
};

exports.updateVerses = async (req, res) => {
  const verses = req.body.verses;

  if (!Array.isArray(verses) || verses.length === 0) {
    return res.status(400).json({ error: "No verses provided" });
  }

  try {
    const queries = verses.map(v => {
      return pool.query(
        "UPDATE verse SET verse = $1, public_id = $2, image_url = $3 WHERE id = $4 RETURNING *",
        [v.verse, v.public_id, v.image_url, v.id]
      );
    });

    const results = await Promise.all(queries);
    const updated = results.map(r => r.rows[0]).filter(Boolean);

    res.status(200).json({ message: "Verses updated", updated });
  } catch (err) {
    console.error("Error updating verses:", err);
    res.status(500).json({ error: "Failed to update verses" });
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
