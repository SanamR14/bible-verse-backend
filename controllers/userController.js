const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, country FROM "users"'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.registerUser = async (req, res) => {
  const { name, email, password, confirm_password, city, country } = req.body;
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
      'INSERT INTO "users" (name, email, password, confirm_password, city, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email',
      [name, email, hashedPassword, confirmHashedPassword, city, country]
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
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
