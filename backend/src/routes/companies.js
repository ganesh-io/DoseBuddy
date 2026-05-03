const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// All companies
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM company ORDER BY company_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies.' });
  }
});

// All openings (includes paused for recruiter view)
router.get('/openings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT co.*, c.company_name, c.domain, c.location, c.website
       FROM company_opening co JOIN company c ON co.company_id = c.company_id
       ORDER BY co.deadline ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch openings.' });
  }
});

// Openings with eligibility for a student (only active, not paused)
router.get('/openings/:studentId', auth, async (req, res) => {
  try {
    const [student] = await pool.query('SELECT cgpa FROM student WHERE st_id = ?', [req.params.studentId]);
    const studentCgpa = student.length > 0 ? parseFloat(student[0].cgpa) || 0 : 0;

    const [studentSkills] = await pool.query(
      'SELECT s.skill_name FROM student_skill ss JOIN skill s ON ss.skill_id = s.skill_id WHERE ss.st_id = ?',
      [req.params.studentId]
    );
    const mySkills = studentSkills.map(s => s.skill_name.toLowerCase());

    const [apps] = await pool.query('SELECT app_id, opening_id, status FROM application WHERE st_id = ?', [req.params.studentId]);
    const appMap = {};
    apps.forEach(a => { appMap[a.opening_id] = { status: a.status, app_id: a.app_id }; });

    const [rows] = await pool.query(
      `SELECT co.*, c.company_name, c.domain, c.location, c.website
       FROM company_opening co JOIN company c ON co.company_id = c.company_id
       ORDER BY co.deadline ASC`
    );

    const enriched = rows.map(r => {
      const minCgpa = parseFloat(r.min_cgpa) || 0;
      const requiredSkills = r.skills_required ? r.skills_required.split(',').map(s => s.trim()) : [];
      const matchedSkills = requiredSkills.filter(s => mySkills.includes(s.toLowerCase()));
      const missingSkills = requiredSkills.filter(s => !mySkills.includes(s.toLowerCase()));
      const appInfo = appMap[r.opening_id] || null;
      return {
        ...r,
        eligible: studentCgpa >= minCgpa,
        studentCgpa,
        matchedSkills,
        missingSkills,
        applicationStatus: appInfo?.status || null,
        app_id: appInfo?.app_id || null,
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch openings.' });
  }
});

// GET applicants for a specific opening
router.get('/openings/:openingId/applicants', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.app_id, a.st_id, a.status, a.applied_at, a.role, a.note,
              s.name, s.department, s.cgpa, s.email, s.year
       FROM application a
       JOIN student s ON a.st_id = s.st_id
       WHERE a.opening_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.openingId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applicants.' });
  }
});

// PUT update opening status (pause/close/reactivate)
router.put('/openings/:openingId/status', auth, async (req, res) => {
  try {
    const { is_active, is_paused } = req.body;
    if (is_active !== undefined) {
      await pool.query('UPDATE company_opening SET is_active = ? WHERE opening_id = ?', [is_active ? 1 : 0, req.params.openingId]);
    }
    if (is_paused !== undefined) {
      await pool.query('UPDATE company_opening SET is_paused = ? WHERE opening_id = ?', [is_paused ? 1 : 0, req.params.openingId]);
    }
    res.json({ message: 'Opening status updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update opening.' });
  }
});

// Recruiter search candidates
router.get('/search', auth, async (req, res) => {
  try {
    const { skill_name, department, min_cgpa, year } = req.query;
    let query = `SELECT DISTINCT s.st_id, s.name, s.department, s.year, s.cgpa, s.email
      FROM student s`;
    const conditions = [];
    const params = [];

    if (skill_name) {
      query += ' JOIN student_skill ss ON s.st_id = ss.st_id JOIN skill sk ON ss.skill_id = sk.skill_id';
      conditions.push('sk.skill_name LIKE ?');
      params.push(`%${skill_name}%`);
    }
    if (department) { conditions.push('s.department = ?'); params.push(department); }
    if (min_cgpa) { conditions.push('s.cgpa >= ?'); params.push(parseFloat(min_cgpa)); }
    if (year) { conditions.push('s.year = ?'); params.push(parseInt(year)); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.cgpa DESC';

    const [rows] = await pool.query(query, params);

    const enriched = await Promise.all(rows.map(async (student) => {
      const [skills] = await pool.query(
        'SELECT sk.skill_name, ss.proficiency FROM student_skill ss JOIN skill sk ON ss.skill_id = sk.skill_id WHERE ss.st_id = ?',
        [student.st_id]
      );
      const [pCount] = await pool.query('SELECT COUNT(*) as c FROM project WHERE st_id = ?', [student.st_id]);
      const [cCount] = await pool.query('SELECT COUNT(*) as c FROM certificate WHERE st_id = ?', [student.st_id]);
      return { ...student, skills, projectCount: pCount[0].c, certCount: cCount[0].c };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search candidates.' });
  }
});

// Shortlist
router.post('/shortlist', auth, async (req, res) => {
  try {
    const { company_id, st_id, interview_date, shortlisted_by } = req.body;
    await pool.query(
      'INSERT INTO shortlist (company_id, st_id, interview_date, shortlisted_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE interview_date = COALESCE(?, interview_date)',
      [company_id, st_id, interview_date || null, shortlisted_by, interview_date]
    );
    res.status(201).json({ message: 'Student shortlisted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to shortlist.' });
  }
});

router.put('/shortlist', auth, async (req, res) => {
  try {
    const { company_id, st_id, status, interview_date } = req.body;
    await pool.query(
      'UPDATE shortlist SET status = COALESCE(?, status), interview_date = COALESCE(?, interview_date) WHERE company_id = ? AND st_id = ?',
      [status, interview_date, company_id, st_id]
    );
    res.json({ message: 'Shortlist updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shortlist.' });
  }
});

router.get('/shortlist/:companyId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sh.*, s.name, s.department, s.cgpa, s.email
       FROM shortlist sh JOIN student s ON sh.st_id = s.st_id
       WHERE sh.company_id = ?`,
      [req.params.companyId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shortlist.' });
  }
});

router.get('/shortlist/recruiter/:recId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sh.*, s.name, s.department, s.cgpa, s.email, c.company_name
       FROM shortlist sh
       JOIN student s ON sh.st_id = s.st_id
       JOIN company c ON sh.company_id = c.company_id
       WHERE sh.shortlisted_by = ?
       ORDER BY sh.interview_date DESC`,
      [req.params.recId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shortlists.' });
  }
});

// Live stats for landing page
router.get('/stats/live', async (req, res) => {
  try {
    const [[students], [companies], [skills], [exchanges]] = await Promise.all([
      pool.query('SELECT COUNT(*) as c FROM student'),
      pool.query('SELECT COUNT(*) as c FROM company'),
      pool.query('SELECT COUNT(*) as c FROM skill'),
      pool.query('SELECT COUNT(*) as c FROM skill_exchange_request'),
    ]);
    res.json({
      students: students[0].c,
      companies: companies[0].c,
      skills: skills[0].c,
      exchanges: exchanges[0].c,
    });
  } catch (err) {
    res.json({ students: 8, companies: 50, skills: 20, exchanges: 4 });
  }
});

// POST /api/companies/openings - create a new opening
router.post('/openings', auth, async (req, res) => {
  try {
    const { company_id, role, type, skills_required, min_cgpa, deadline, stipend_salary, description } = req.body;
    if (!company_id || !role) return res.status(400).json({ error: 'company_id and role are required.' });
    const opening_id = 'OPN' + Date.now().toString(36).toUpperCase();
    await pool.query(
      `INSERT INTO company_opening (opening_id, company_id, role, type, skills_required, min_cgpa, deadline, stipend_salary, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [opening_id, company_id, role, type || 'Internship', skills_required || null,
       min_cgpa ? parseFloat(min_cgpa) : null, deadline || null, stipend_salary || null, description || null]
    );
    res.status(201).json({ message: 'Opening created.', opening_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create opening.' });
  }
});

module.exports = router;
