const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// transporter (use Gmail or better: SendGrid/SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password
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

// REGISTER user with verification
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

    // generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1h expiry

    const result = await pool.query(
      'INSERT INTO "users" (name, email, password, confirm_password, city, country, isverified, verify_token, verify_token_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, name, email',
      [
        name,
        email,
        hashedPassword,
        hashedPassword,
        city,
        country,
        false,
        token,
        expiry,
      ]
    );

    // send email
    const verifyUrl = `https://your-backend.com/api/auth/verify/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Verify your account",
      html: `<h2>Welcome, ${name}!</h2>
             <p>Please verify your email by clicking below:</p>
             <a href="${verifyUrl}">Verify Email</a>`,
    });

    res.status(201).json({ message: "User registered, check email to verify" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// VERIFY user
exports.verifyUser = async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "users" WHERE verify_token = $1 AND verify_token_expiry > NOW()',
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    await pool.query(
      'UPDATE "users" SET isverified = true, verify_token = NULL, verify_token_expiry = NULL WHERE id = $1',
      [user.id]
    );

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
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
