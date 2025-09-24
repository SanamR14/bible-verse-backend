const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, country, is_private, church, is_church_admin FROM "users"'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, country, is_private, church, is_church_admin FROM "users" WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password, confirm_password, city, country, church } =
    req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }
  try {
    const existingUser = await pool.query(
      'SELECT id FROM "users" WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmHashedPassword = await bcrypt.hash(confirm_password, 10);
    const result = await pool.query(
      'INSERT INTO "users" (name, email, password, confirm_password, city, country, church) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, church',
      [
        name,
        email,
        hashedPassword,
        confirmHashedPassword,
        city,
        country,
        church || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM "users" WHERE id = $1', [id]);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    await pool.query('UPDATE "users" SET refresh_token=$1 WHERE id=$2', [
      refreshToken,
      user.id,
    ]);

    res
      .status(200)
      .json({ message: "Login successful", token, refreshToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const result = await pool.query('SELECT * FROM "users" WHERE id=$1', [
      decoded.userId,
    ]);
    if (!result.rows[0] || result.rows[0].refresh_token !== token) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

exports.logoutUser = async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query('UPDATE "users" SET refresh_token=NULL WHERE id=$1', [
      userId,
    ]);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
};

exports.updateUserPrivacy = async (req, res) => {
  const { id } = req.params;
  const { is_private } = req.body;

  if (typeof is_private !== "boolean") {
    return res.status(400).json({ error: "is_private must be true or false" });
  }

  try {
    const result = await pool.query(
      'UPDATE "users" SET is_private = $1 WHERE id = $2 RETURNING id, name, email, is_private',
      [is_private, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Privacy updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update privacy setting" });
  }
};

exports.updateChurchAdmin = async (req, res) => {
  const { id } = req.params;
  const { is_church_admin } = req.body;

  if (typeof is_church_admin !== "boolean") {
    return res
      .status(400)
      .json({ error: "is_church_admin must be true or false" });
  }

  try {
    const result = await pool.query(
      'UPDATE "users" SET is_church_admin = $1 WHERE id = $2 RETURNING id, name, email, is_church_admin, church',
      [is_church_admin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "is_church_admin updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update admin setting" });
  }
};

exports.getUsersByChurch = async (req, res) => {
  let { church, city } = req.query;

  if (!church || !city) {
    return res.status(400).json({
      error: "Please provide church, city query parameters",
    });
  }

  try {
    // Trim and normalize
    church = church.trim().toLowerCase();
    city = city.trim().toLowerCase();

    console.log("Searching for:", { church, city });

    const result = await pool.query(
      `SELECT id, name, email, city, country, is_private, church, is_church_admin 
       FROM "users" 
       WHERE TRIM(LOWER(COALESCE(church, ''))) = $1
         AND TRIM(LOWER(COALESCE(city, ''))) = $2`,
      [church, city]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for the given filters" });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: err.message });
  }
};
