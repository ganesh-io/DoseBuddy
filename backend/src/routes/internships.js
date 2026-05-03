const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/student/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, si.start_date, si.end_date
       FROM student_intern si JOIN internship i ON si.intern_id = i.intern_id
       WHERE si.st_id = ? ORDER BY si.start_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch internships.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { st_id, company, role, duration, stipend, start_date, end_date } = req.body;
    const intern_id = 'INT' + Date.now().toString(36).toUpperCase();
    await pool.query('INSERT INTO internship (intern_id, company, role, duration, stipend) VALUES (?, ?, ?, ?, ?)',
      [intern_id, company, role, duration || null, stipend || 0]);
    await pool.query('INSERT INTO student_intern (st_id, intern_id, start_date, end_date) VALUES (?, ?, ?, ?)',
      [st_id, intern_id, start_date || null, end_date || null]);
    res.status(201).json({ message: 'Internship added.', intern_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add internship.' });
  }
});

router.delete('/:internId/student/:stId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM student_intern WHERE intern_id = ? AND st_id = ?', [req.params.internId, req.params.stId]);
    res.json({ message: 'Internship removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove internship.' });
  }
});

module.exports = router;
