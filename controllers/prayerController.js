const pool = require("../db");

//post

exports.addPrayerRequest = async (req, res) => {
  const { userid, username, prayer } = req.body;

  // Validation
  if (!userid || !username || !prayer) {
    return res.status(400).json({
      error: "Missing required fields: userid, username, or prayer",
    });
  }

  const query = `
    INSERT INTO prayer_request (userid, username, prayer)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [userid, username, prayer]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: "Failed to insert prayer request" });
  }
};

//get all prayer request

exports.getAllPrayerRequest = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM prayer_request ORDER BY userid"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//get prayer requests by userid

exports.getPrayerRequestByUser = async (req, res) => {
  const { userid } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM prayer_request WHERE userid = $1",
      [userid]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No prayer requests found for this user" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//delete

exports.deletePrayerRequest = async (req, res) => {
  const { userid, prayerid } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM prayer_request WHERE userid = $1 AND prayerid = $2 RETURNING *",
      [userid, prayerid]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "prayerRequest not found or prayerid mismatch" });
    }

    res.status(200).json({ message: "prayerRequest deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete prayer request" });
  }
};
