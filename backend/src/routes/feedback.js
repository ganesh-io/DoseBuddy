const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/:matchId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sf.*, s.name as reviewer_name FROM skill_feedback sf
       JOIN student s ON sf.reviewer_id = s.st_id WHERE sf.match_id = ?`,
      [req.params.matchId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { match_id, reviewer_id, rating, comments } = req.body;
    const fb_id = 'FB' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO skill_feedback (fb_id, match_id, reviewer_id, rating, comments, fb_date) VALUES (?, ?, ?, ?, ?, CURDATE())',
      [fb_id, match_id, reviewer_id, rating, comments || null]
    );
    res.status(201).json({ message: 'Feedback submitted.', fb_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

module.exports = router;
