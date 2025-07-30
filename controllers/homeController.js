const pool = require('../db');

exports.getHomeData = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // 1. Get user
    const userResult = await pool.query(
      'SELECT name FROM "user" WHERE id = $1',
      [email]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Get total verse count
    const countResult = await pool.query('SELECT COUNT(*) FROM verse');
    const totalVerses = parseInt(countResult.rows[0].count, 10);

    // 3. Choose verse by date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const verseIndex = (dayOfYear % totalVerses) + 1;

    const verseResult = await pool.query(
      'SELECT verse, reference FROM verse WHERE id = $1',
      [verseIndex]
    );
    const verse = verseResult.rows[0];

    // 4. Combine
    res.json({
      user: user.name,
      verse: verse.verse,
      reference: verse.reference
    });

  } catch (err) {
    console.error('Error in /home:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
