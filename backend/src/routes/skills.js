const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/skills — all skills
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM skill ORDER BY category, skill_name');
    res.json(rows);
  } catch (err) {
    console.error('Get skills error:', err);
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// GET /api/skills/student/:id — student's skills with proficiency
router.get('/student/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ss.skill_id, s.skill_name, s.category, s.level, ss.proficiency
       FROM student_skill ss JOIN skill s ON ss.skill_id = s.skill_id
       WHERE ss.st_id = ? ORDER BY s.category, s.skill_name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get student skills error:', err);
    res.status(500).json({ error: 'Failed to fetch student skills.' });
  }
});

// POST /api/skills/student/:id — add skill
router.post('/student/:id', auth, async (req, res) => {
  try {
    const { skill_id, proficiency } = req.body;
    if (!skill_id || !proficiency) {
      return res.status(400).json({ error: 'skill_id and proficiency are required.' });
    }
    await pool.query(
      'INSERT INTO student_skill (st_id, skill_id, proficiency) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proficiency = ?',
      [req.params.id, skill_id, proficiency, proficiency]
    );
    res.status(201).json({ message: 'Skill added successfully.' });
  } catch (err) {
    console.error('Add skill error:', err);
    res.status(500).json({ error: 'Failed to add skill.' });
  }
});

// DELETE /api/skills/student/:id/:skillId — remove skill
router.delete('/student/:id/:skillId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM student_skill WHERE st_id = ? AND skill_id = ?', [req.params.id, req.params.skillId]);
    res.json({ message: 'Skill removed.' });
  } catch (err) {
    console.error('Delete skill error:', err);
    res.status(500).json({ error: 'Failed to remove skill.' });
  }
});

// GET /api/skills/availability/:id — student's teaching availability
router.get('/availability/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sa.*, s.skill_name FROM skill_availability sa
       JOIN skill s ON sa.skill_id = s.skill_id
       WHERE sa.st_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability.' });
  }
});

// POST /api/skills/availability — add availability slot
router.post('/availability', auth, async (req, res) => {
  try {
    const { st_id, skill_id, available_day, available_time, duration_mins, mode } = req.body;
    const avail_id = 'AVL' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO skill_availability (avail_id, st_id, skill_id, available_day, available_time, duration_mins, mode) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [avail_id, st_id, skill_id, available_day, available_time, duration_mins || 60, mode || 'Online']
    );
    res.status(201).json({ message: 'Availability added.', avail_id });
  } catch (err) {
    console.error('Add availability error:', err);
    res.status(500).json({ error: 'Failed to add availability.' });
  }
});

// DELETE /api/skills/availability/:availId — remove slot
router.delete('/availability/:availId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM skill_availability WHERE avail_id = ?', [req.params.availId]);
    res.json({ message: 'Availability removed.' });
  } catch (err) {
    console.error('Delete availability error:', err);
    res.status(500).json({ error: 'Failed to remove availability.' });
  }
});

// GET /api/skills/availability/all — all students' availability (for Discover section)
router.get('/availability/all', auth, async (req, res) => {
  try {
    const currentId = req.query.exclude || '';
    const [rows] = await pool.query(
      `SELECT sa.*, s.name, s.department, s.year,
        s.email, s.phone,
        sk.skill_name
       FROM skill_availability sa
       JOIN student s ON sa.st_id = s.st_id
       JOIN skill sk ON sa.skill_id = sk.skill_id
       WHERE sa.st_id != ?
       ORDER BY sa.available_day, sa.available_time`,
      [currentId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get all availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability.' });
  }
});

module.exports = router;
