const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/recruiters/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT rec_id, name, company_email, company_name, company_size, website, superior_ref, role, joined_at FROM recruiter WHERE rec_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Recruiter not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get recruiter error:', err);
    res.status(500).json({ error: 'Failed to fetch recruiter profile.' });
  }
});

// PUT /api/recruiters/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, company_name, company_size, website, superior_ref } = req.body;
    await pool.query(
      'UPDATE recruiter SET name = COALESCE(?, name), company_name = COALESCE(?, company_name), company_size = COALESCE(?, company_size), website = COALESCE(?, website), superior_ref = COALESCE(?, superior_ref) WHERE rec_id = ?',
      [name, company_name, company_size, website, superior_ref, req.params.id]
    );
    const [updated] = await pool.query(
      'SELECT rec_id, name, company_email, company_name, company_size, website, superior_ref, role, joined_at FROM recruiter WHERE rec_id = ?',
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error('Update recruiter error:', err);
    res.status(500).json({ error: 'Failed to update recruiter profile.' });
  }
});

module.exports = router;
