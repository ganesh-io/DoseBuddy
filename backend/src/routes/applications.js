const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/student/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.company_name, c.domain FROM application a
       JOIN company c ON a.company_id = c.company_id
       WHERE a.st_id = ? ORDER BY a.applied_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { st_id, company_id, opening_id, role, note } = req.body;
    const app_id = 'APP' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO application (app_id, st_id, company_id, opening_id, role, note) VALUES (?, ?, ?, ?, ?, ?)',
      [app_id, st_id, company_id, opening_id || null, role || null, note || null]
    );
    res.status(201).json({ message: 'Application submitted.', app_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already applied.' });
    }
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

router.put('/:appId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE application SET status = ? WHERE app_id = ?', [status, req.params.appId]);
    res.json({ message: 'Application updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application.' });
  }
});

router.delete('/:appId', auth, async (req, res) => {
  try {
    console.log('[Withdraw] Deleting application:', req.params.appId);
    const [result] = await pool.query('DELETE FROM application WHERE app_id = ?', [req.params.appId]);
    console.log('[Withdraw] Delete result:', result.affectedRows, 'rows');
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    res.json({ message: 'Application withdrawn.' });
  } catch (err) {
    console.error('[Withdraw] Error:', err);
    res.status(500).json({ error: 'Failed to withdraw application.' });
  }
});

module.exports = router;
