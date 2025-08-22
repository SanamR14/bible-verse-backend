const pool = require("../db");

// Save an item post
exports.addSavedItem = async (req, res) => {
  try {
    const { userid, item_type, item_id, title, content } = req.body;

    if (!userid || !item_type || !item_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO saved_items (userid, item_type, item_id, title, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userid, item_type, item_id, title, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all saved items for a user
exports.getUserSavedItems = async (req, res) => {
  try {
    const { userid } = req.params;
    const result = await pool.query(
      "SELECT * FROM saved_items WHERE userid=$1",
      [userid]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching saved items:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single saved item
exports.getSavedItem = async (req, res) => {
  try {
    const { userid, id } = req.params;
    const result = await pool.query(
      "SELECT * FROM saved_items WHERE userid=$1 AND id=$2 ",
      [userid, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSavedItemid = async (req, res) => {
  try {
    const { item_type, userid, item_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM saved_items WHERE item_type=$1 AND userid=$2 AND item_id=$3 ",
      [item_type, parseInt(userid), parseInt(item_id)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a saved item
exports.deleteSavedItem = async (req, res) => {
  try {
    const { item_type, userid, item_id } = req.params;

    const result = await pool.query(
      "DELETE FROM saved_items WHERE item_type=$1 AND userid=$2 AND item_id=$3 RETURNING *",
      [item_type, userid, item_id]
    );
    console.log(result.rows);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item removed from saved", item: result.rows[0] });
  } catch (err) {
    console.error("Error deleting saved item:", err);
    res.status(500).json({ error: "Server error" });
  }
};
