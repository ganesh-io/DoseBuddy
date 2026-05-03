const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/students/:id — profile without password_hash
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT st_id, name, email, department, year, phone, cgpa, role, joined_at FROM student WHERE st_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found.' });

    // Also get resume info
    const [resume] = await pool.query('SELECT * FROM resume WHERE st_id = ?', [req.params.id]);
    res.json({ ...rows[0], resume: resume[0] || null });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
});

// PUT /api/students/:id — update profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, year, department, cgpa, summary, linkedin_url, github_url, portfolio_url } = req.body;
    await pool.query(
      'UPDATE student SET name = COALESCE(?, name), phone = COALESCE(?, phone), year = COALESCE(?, year), department = COALESCE(?, department), cgpa = COALESCE(?, cgpa) WHERE st_id = ?',
      [name, phone, year, department, cgpa, req.params.id]
    );

    // Update or insert resume
    if (summary !== undefined || linkedin_url !== undefined || github_url !== undefined || portfolio_url !== undefined) {
      const [existing] = await pool.query('SELECT resume_id FROM resume WHERE st_id = ?', [req.params.id]);
      if (existing.length > 0) {
        await pool.query(
          'UPDATE resume SET summary = COALESCE(?, summary), linkedin_url = COALESCE(?, linkedin_url), github_url = COALESCE(?, github_url), portfolio_url = COALESCE(?, portfolio_url) WHERE st_id = ?',
          [summary, linkedin_url, github_url, portfolio_url, req.params.id]
        );
      } else {
        const resume_id = 'RES' + Date.now().toString(36).toUpperCase();
        await pool.query(
          'INSERT INTO resume (resume_id, st_id, summary, linkedin_url, github_url, portfolio_url) VALUES (?, ?, ?, ?, ?, ?)',
          [resume_id, req.params.id, summary || null, linkedin_url || null, github_url || null, portfolio_url || null]
        );
      }
    }

    const [updated] = await pool.query('SELECT st_id, name, email, department, year, phone, cgpa, role, joined_at FROM student WHERE st_id = ?', [req.params.id]);
    const [resume] = await pool.query('SELECT * FROM resume WHERE st_id = ?', [req.params.id]);
    res.json({ ...updated[0], resume: resume[0] || null });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/students/:id/password — change password
router.put('/:id/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }

    const [rows] = await pool.query('SELECT password_hash FROM student WHERE st_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found.' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE student SET password_hash = ? WHERE st_id = ?', [newHash, req.params.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;
