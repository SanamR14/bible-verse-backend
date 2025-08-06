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
exports.createPlan = async (req, res) => {
  const plans = req.body;

  if (!Array.isArray(plans)) {
    return res
      .status(400)
      .json({ error: "Request body must be an array of plan objects" });
  }

  // Make sure all required fields are present
  const valid = plans.every(
    (p) => p.title && p.message && p.outertitle && p.author
  );

  if (!valid) {
    return res.status(400).json({
      error:
        "All plan objects must have title, message, outertitle, and author",
    });
  }

  // Build the query
  const values = [];
  const placeholders = plans.map((plan, i) => {
    const index = i * 4;
    values.push(plan.title, plan.message, plan.outertitle, plan.author);
    return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4})`;
  });

  const query = `
    INSERT INTO plans (title, message, outertitle, author)
    VALUES ${placeholders.join(", ")}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows);
  } catch (err) {
    console.error("Bulk insert error:", err.message); // ← helpful for debugging
    res.status(500).json({ error: "Failed to insert plans" });
  }
};

// PUT (update) a plan
exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { title, message, outertitle, author } = req.body;
  try {
    const result = await pool.query(
      "UPDATE plans SET title = $1, message = $2, outertitle = $3, author = $4 WHERE id = $5 RETURNING *",
      [title, message, outertitle, author, id]
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
