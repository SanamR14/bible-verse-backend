const pool = require("../db");

// ✅ Create new event
exports.createEvent = async (req, res) => {
  const { date, title, description } = req.body;
  const { userId } = req.user; // extracted from JWT (UUID)

  try {
    const result = await pool.query(
      `INSERT INTO events (date, title, description, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [date, title, description, userId] // userId is UUID
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// ✅ Get all events
exports.getEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name AS created_by_name 
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.date ASC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// ✅ Update event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { date, title, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events 
       SET date = $1, title = $2, description = $3 
       WHERE id = $4 RETURNING *`,
      [date, title, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
};

// ✅ Delete event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
};
