const pool = require("../db");

exports.createEvent = async (req, res) => {
  const { event_date, event_time, title, description } = req.body;
  const { userId } = req.user; // extracted from JWT (UUID)

  try {
    const result = await pool.query(
      `INSERT INTO events (event_date, event_time, title, description, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [event_date, event_time, title, description, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.event_date, e.event_time, e.title, e.description,
              u.name AS created_by_name 
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date ASC, e.event_time ASC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { event_date, event_time, title, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events 
       SET event_date = $1, event_time = $2, title = $3, description = $4
       WHERE id = $5 RETURNING *`,
      [event_date, event_time, title, description, id]
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
