// const express = require("express");
// const cors = require("cors");
// const pool = require("./db");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// // Get today's verse
// app.get("/verse", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM verse ORDER BY id");
//     const allVerses = result.rows;

//     const today = new Date();
//     const dayOfYear = Math.floor(
//       (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
//     );

//     const verseOfTheDay = allVerses[dayOfYear % allVerses.length];

//     res.json(verseOfTheDay);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// // GET all plans
// app.get('/api/plans', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM plans');
//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error('GET error:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // POST a new plan
// app.post('/api/plans', async (req, res) => {
//   const { name, description } = req.body; // adjust fields as per your schema
//   try {
//     const result = await pool.query(
//       'INSERT INTO plans (name, description) VALUES ($1, $2) RETURNING *',
//       [name, description]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('POST error:', err);
//     res.status(400).json({ error: 'Failed to create data' });
//   }
// });

// // PUT update an existing plan
// app.put('/api/plans', async (req, res) => {
//   const { id, ...fields } = req.body;

//   if (!id) {
//     return res.status(400).json({ error: 'ID is required for update' });
//   }

//   const keys = Object.keys(fields);
//   if (keys.length === 0) {
//     return res.status(400).json({ error: 'No fields provided for update' });
//   }

//   const setString = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
//   const values = keys.map((key) => fields[key]);

//   try {
//     const result = await pool.query(
//       `UPDATE plans SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`,
//       [...values, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Item not found' });
//     }

//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('PUT error:', err);
//     res.status(500).json({ error: 'Failed to update data' });
//   }
// });


// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const plansRoute = require('./routes/plans');
const verseRoute = require('./routes/verse');
const userRoute = require('./routes/user');
const homeRoute = require('./routes/home');
const authMiddleware = require('./middleware/auth');
const prayerRequestRoute = require('./routes/prayer');
const devotions = require('./routes/devotions');

app.use('/home', homeRoute);
app.use('/bibleverse', verseRoute);
app.use('/auth', userRoute);
app.use('/plans', plansRoute);
app.use('/prayer-requests', prayerRequestRoute);
app.use('/devotions', devotions);

// Protected route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.send(`Hello user with ID: ${req.user.userId}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
