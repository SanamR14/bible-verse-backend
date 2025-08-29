const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GET all users
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, country, isverified FROM "users"'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Register User with Email Verification
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

    // create user with "is_verified = false"
    const result = await pool.query(
      'INSERT INTO "users" (name, email, password, city, country, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email',
      [name, email, hashedPassword, city, country, false]
    );

    const newUser = result.rows[0];

    // create email verification token (valid for 1 hour)
    const verifyToken = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    // send email
    await transporter.sendMail({
      from: `"Bible App" <${process.env.SMTP_USER}>`,
      to: newUser.email,
      subject: "Verify your email",
      html: `
        <h2>Welcome, ${newUser.name}!</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyUrl}" target="_blank">Verify Email</a>
      `,
    });

    res.status(201).json({
      message: "User registered. Please check your email to verify.",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};
// ✅ Verify Email Endpoint
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await pool.query(
      'UPDATE "users" SET is_verified = true WHERE id = $1',
      [userId]
    );

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// LOGIN user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.isverified) {
      return res.status(403).json({ error: "Email not verified" });
    }

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
