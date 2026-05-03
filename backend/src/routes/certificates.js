const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/student/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM certificate WHERE st_id = ? ORDER BY issue_date DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { st_id, cert_name, issuer, issue_date, cert_url } = req.body;
    const cert_id = 'CRT' + Date.now().toString(36).toUpperCase();
    await pool.query('INSERT INTO certificate (cert_id, st_id, cert_name, issuer, issue_date, cert_url) VALUES (?, ?, ?, ?, ?, ?)',
      [cert_id, st_id, cert_name, issuer || null, issue_date || null, cert_url || null]);
    res.status(201).json({ message: 'Certificate added.', cert_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add certificate.' });
  }
});

router.delete('/:certId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM certificate WHERE cert_id = ?', [req.params.certId]);
    res.json({ message: 'Certificate removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove certificate.' });
  }
});

module.exports = router;
