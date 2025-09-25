const pool = require("../db");

exports.getRotaByDate = async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS member_name 
       FROM rota r
       LEFT JOIN users u ON r.member_id = u.id
       WHERE r.rota_date = $1
       ORDER BY r.rota_time ASC`, // order by time in the day
      [date]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching rota:", err);
    res.status(500).json({ error: "Failed to fetch rota" });
  }
};

exports.createRota = async (req, res) => {
  const { rota_date, rota_time, member_id, duty } = req.body;
  const { userId } = req.user; // admin UUID

  try {
    const result = await pool.query(
      `INSERT INTO rota (rota_date, rota_time, member_id, duty, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [rota_date, rota_time, member_id, duty, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating rota:", err);
    res.status(500).json({ error: "Failed to create rota" });
  }
};

exports.updateRota = async (req, res) => {
  const { id } = req.params;
  const { duty, rota_date, rota_time } = req.body;

  try {
    const result = await pool.query(
      `UPDATE rota 
       SET duty = COALESCE($1, duty),
           rota_date = COALESCE($2, rota_date),
           rota_time = COALESCE($3, rota_time)
       WHERE id = $4 RETURNING *`,
      [duty, rota_date, rota_time, id]
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
  const { month } = req.query; // "2025-09"

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS member_name
       FROM rota r
       LEFT JOIN users u ON r.member_id = u.id
       WHERE TO_CHAR(r.rota_date, 'YYYY-MM') = $1
       ORDER BY r.rota_date ASC, r.rota_time ASC`,
      [month]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching rota by month:", err);
    res.status(500).json({ error: "Failed to fetch rota" });
  }
};


exports.getRotaByMember = async (req, res) => {
  const { memberId } = req.params; // memberId will be passed in the route

  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS member_name
       FROM rota r
       LEFT JOIN users u ON r.member_id = u.id
       WHERE r.member_id = $1
       ORDER BY r.date ASC`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No rota found for this member" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching rota by member:", err);
    res.status(500).json({ error: "Failed to fetch rota" });
  }
};
