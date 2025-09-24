const pool = require("../db");

exports.getRotaByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS member_name 
       FROM rota r
       LEFT JOIN users u ON r.member_id = u.id
       WHERE r.date = $1
       ORDER BY r.id ASC`,
      [date]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching rota:", err);
    res.status(500).json({ error: "Failed to fetch rota" });
  }
};

exports.createRota = async (req, res) => {
  const { date, member_id, duty } = req.body; // member_id must be UUID
  const { userId } = req.user; // admin’s UUID

  try {
    const result = await pool.query(
      `INSERT INTO rota (date, member_id, duty, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [date, member_id, duty, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating rota:", err);
    res.status(500).json({ error: "Failed to create rota" });
  }
};

exports.updateRota = async (req, res) => {
  const { id } = req.params;
  const { duty } = req.body;

  try {
    const result = await pool.query(
      `UPDATE rota 
       SET duty = $1 
       WHERE id = $2 RETURNING *`,
      [duty, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Rota not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating rota:", err);
    res.status(500).json({ error: "Failed to update rota" });
  }
};

exports.deleteRota = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM rota WHERE id = $1", [id]);
    res.status(200).json({ message: "Rota entry deleted" });
  } catch (err) {
    console.error("Error deleting rota:", err);
    res.status(500).json({ error: "Failed to delete rota" });
  }
};

exports.getRotaByMonth = async (req, res) => {
  const { month } = req.query; // e.g. "2025-09"

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS member_name
       FROM rota r
       LEFT JOIN users u ON r.member_id = u.id
       WHERE TO_CHAR(r.date, 'YYYY-MM') = $1
       ORDER BY r.date ASC`,
      [month]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching rota by month:", err);
    res.status(500).json({ error: "Failed to fetch rota" });
  }
};
