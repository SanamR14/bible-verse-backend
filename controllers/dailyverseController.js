const pool = require("../db");

exports.getDailyVerse = async (req, res) => {
  try {
    // get total verse count
    const countResult = await pool.query("SELECT COUNT(*) FROM verse");
    const totalVerses = parseInt(countResult.rows[0].count, 10);

    // choose verse by date
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) /
        (1000 * 60 * 60 * 24)
    );
    const verseIndex = (dayOfYear % totalVerses) + 1;

    const verseResult = await pool.query(
      "SELECT verse, reference, image_url FROM verse WHERE id = $1",
      [verseIndex]
    );

    const verse = verseResult.rows[0];

    res.json(verse);
  } catch (err) {
    console.error("Error in /home:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET all verses
exports.getAllVerses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM verse ORDER BY id");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST new verse
exports.postVerse = async (req, res) => {
  const { image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO verse (image_url) VALUES ($1) RETURNING *",
      [image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to create verse" });
  }
};

// PUT update verse
exports.updateVerse = async (req, res) => {
  const { id, image_url } = req.body;
  try {
    const result = await pool.query(
      "UPDATE verse SET image_url = $1 WHERE id = $2 RETURNING *",
      [image_url, id]
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
    const queries = verses.map((v) => {
      return pool.query(
        "UPDATE verse SET image_url = $1 WHERE id = $2 RETURNING *",
        [v.image_url, v.id]
      );
    });

    const results = await Promise.all(queries);
    const updated = results.map((r) => r.rows[0]).filter(Boolean);

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
