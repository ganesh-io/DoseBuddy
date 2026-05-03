const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

// POST /api/auth/register-student
router.post('/register-student', async (req, res) => {
  try {
    const { st_id, name, email, password, department, year, phone, cgpa } = req.body;
    if (!st_id || !name || !email || !password || !department) {
      return res.status(400).json({ error: 'Missing required fields: st_id, name, email, password, department' });
    }

    const [existing] = await pool.query('SELECT st_id FROM student WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO student (st_id, name, email, password_hash, department, year, phone, cgpa, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [st_id, name, email, password_hash, department, year || null, phone || null, cgpa || null, 'student']
    );

    const token = jwt.sign({ id: st_id, email, name, role: 'student' }, SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { st_id, name, email, department, year, phone, cgpa, role: 'student' },
    });
  } catch (err) {
    console.error('Register student error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/register-recruiter
router.post('/register-recruiter', async (req, res) => {
  try {
    const { name, company_email, company_name, company_size, password, website, superior_ref } = req.body;
    if (!name || !company_email || !company_name || !company_size || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, company_email, company_name, company_size, password' });
    }

    const [existing] = await pool.query('SELECT rec_id FROM recruiter WHERE company_email = ?', [company_email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const rec_id = 'REC' + Date.now().toString(36).toUpperCase();
    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO recruiter (rec_id, name, company_email, company_name, company_size, website, superior_ref, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rec_id, name, company_email, company_name, company_size, website || null, superior_ref || null, password_hash, 'recruiter']
    );

    const token = jwt.sign({ id: rec_id, email: company_email, name, role: 'recruiter' }, SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { rec_id, name, company_email, company_name, company_size, role: 'recruiter' },
    });
  } catch (err) {
    console.error('Register recruiter error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check student table first
    const [students] = await pool.query('SELECT * FROM student WHERE email = ?', [email]);
    if (students.length > 0) {
      const student = students[0];
      const match = await bcrypt.compare(password, student.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid password.' });

      const token = jwt.sign(
        { id: student.st_id, email: student.email, name: student.name, role: 'student' },
        SECRET,
        { expiresIn: '7d' }
      );
      const { password_hash, ...userData } = student;
      return res.json({ token, user: userData, role: 'student' });
    }

    // Check recruiter table
    const [recruiters] = await pool.query('SELECT * FROM recruiter WHERE company_email = ?', [email]);
    if (recruiters.length > 0) {
      const recruiter = recruiters[0];
      const match = await bcrypt.compare(password, recruiter.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid password.' });

      const token = jwt.sign(
        { id: recruiter.rec_id, email: recruiter.company_email, name: recruiter.name, role: 'recruiter' },
        SECRET,
        { expiresIn: '7d' }
      );
      const { password_hash, ...userData } = recruiter;
      return res.json({ token, user: userData, role: 'recruiter' });
    }

    return res.status(404).json({ error: 'No account found with this email.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
