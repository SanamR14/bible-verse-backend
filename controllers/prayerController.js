const pool = require("../db");

//post

exports.addPrayerRequest = async (req, res) => {
  const prayerRequest = req.body;

  if (!Array.isArray(plans)) {
    return res
      .status(400)
      .json({ error: "Request body must be an array of plan objects" });
  }

  // Make sure all required fields are present
  const valid = prayerRequest.every(
    (p) => p.userId && p.userName && p.prayer && p.prayerid
  );

  if (!valid) {
    return res.status(400).json({
      error:
        "All plan objects must have title, message, outerTitle, and author",
    });
  }

  // Build the query
  const values = [];
  const placeholders = plans.map((plan, i) => {
    const index = i * 4;
    values.push(plan.userId, plan.userName, plan.prayer, plan.prayerid);
    return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4})`;
  });

  const query = `
    INSERT INTO prayerRequest (userId, userName, prayer, prayerid)
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

//get all prayer request

exports.getAllPrayerRequest = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM prayerRequest ORDER BY userId");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//get prayer requests by userId


exports.getPrayerRequestByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM prayerRequest WHERE userId = $1 ORDER BY id DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No prayer requests found for this user" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



//delete

exports.deletePrayerRequest = async (req, res) => {
  const { userId, prayerid } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM prayerRequest WHERE userId = $1 AND prayerid = $2 RETURNING *",
      [userId, prayerid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Plan not found or prayerid mismatch" });
    }

    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete plan" });
  }
};
