const pool = require("../db");

// GET all plans
exports.getAllPlans = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM plans ORDER BY id");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST a new plan
exports.createDevotions = async (req, res) => {
  const { title, message, outertitle, author, days } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO devotions (title, message, outertitle, author, days) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, message, outertitle, author, days]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to create plan" });
  }
};

// PUT (update) a plan
exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { title, message, outertitle, author, image } = req.body;
  try {
    const result = await pool.query(
      "UPDATE plans SET title = $1, message = $2, outertitle = $3, author = $4, image = $5 WHERE id = $6 RETURNING *",
      [title, message, outertitle, author, image, id]
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

// DELETE a plan
exports.deletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM plans WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
};
