const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/student/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM project WHERE st_id = ? ORDER BY created_date DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { st_id, title, description, tech_stack, github_url, live_url, created_date } = req.body;
    const project_id = 'PRJ' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO project (project_id, st_id, title, description, tech_stack, github_url, live_url, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [project_id, st_id, title, description || null, tech_stack || null, github_url || null, live_url || null, created_date || null]
    );
    res.status(201).json({ message: 'Project added.', project_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add project.' });
  }
});

router.put('/:projectId', auth, async (req, res) => {
  try {
    const { title, description, tech_stack, github_url, live_url } = req.body;
    await pool.query(
      'UPDATE project SET title=COALESCE(?,title), description=COALESCE(?,description), tech_stack=COALESCE(?,tech_stack), github_url=COALESCE(?,github_url), live_url=COALESCE(?,live_url) WHERE project_id=?',
      [title, description, tech_stack, github_url, live_url, req.params.projectId]
    );
    const [updated] = await pool.query('SELECT * FROM project WHERE project_id = ?', [req.params.projectId]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

router.delete('/:projectId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM project WHERE project_id = ?', [req.params.projectId]);
    res.json({ message: 'Project removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove project.' });
  }
});

module.exports = router;
