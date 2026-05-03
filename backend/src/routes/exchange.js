const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ser.*, s.name as requester_name, s.email as requester_email, s.phone as requester_phone,
        sw.skill_name as wanted_name, so.skill_name as offered_name
       FROM skill_exchange_request ser
       JOIN student s ON ser.requester_id = s.st_id
       JOIN skill sw ON ser.skill_wanted = sw.skill_id
       JOIN skill so ON ser.skill_offered = so.skill_id
       ORDER BY ser.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exchange requests.' });
  }
});

router.get('/mine/:stId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ser.*, sw.skill_name as wanted_name, so.skill_name as offered_name
       FROM skill_exchange_request ser
       JOIN skill sw ON ser.skill_wanted = sw.skill_id
       JOIN skill so ON ser.skill_offered = so.skill_id
       WHERE ser.requester_id = ? ORDER BY ser.created_at DESC`,
      [req.params.stId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your requests.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { requester_id, skill_wanted, skill_offered } = req.body;
    const req_id = 'REQ' + Date.now().toString(36).toUpperCase();
    await pool.query(
      'INSERT INTO skill_exchange_request (req_id, requester_id, skill_wanted, skill_offered) VALUES (?, ?, ?, ?)',
      [req_id, requester_id, skill_wanted, skill_offered]
    );
    res.status(201).json({ message: 'Exchange request created.', req_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create request.' });
  }
});

router.delete('/:reqId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM skill_exchange_request WHERE req_id = ?', [req.params.reqId]);
    res.json({ message: 'Request removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove request.' });
  }
});

// Compatible students: mutual skill match
router.get('/compatible/:stId', auth, async (req, res) => {
  try {
    const stId = req.params.stId;
    const [rows] = await pool.query(`
      SELECT DISTINCT s.st_id, s.name, s.department, s.cgpa,
        s.email, s.phone,
        sw.skill_name as they_want, so.skill_name as they_offer
      FROM skill_exchange_request their_req
      JOIN student s ON their_req.requester_id = s.st_id
      JOIN skill sw ON their_req.skill_wanted = sw.skill_id
      JOIN skill so ON their_req.skill_offered = so.skill_id
      WHERE their_req.requester_id != ?
        AND their_req.skill_offered IN (SELECT skill_wanted FROM skill_exchange_request WHERE requester_id = ?)
        AND their_req.skill_wanted IN (SELECT skill_offered FROM skill_exchange_request WHERE requester_id = ?)
    `, [stId, stId, stId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to find compatible students.' });
  }
});

// Teachers for a specific skill
router.get('/teachers/:skillId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sa.*, s.name, s.department, s.email, s.phone, sk.skill_name
      FROM skill_availability sa
      JOIN student s ON sa.st_id = s.st_id
      JOIN skill sk ON sa.skill_id = sk.skill_id
      WHERE sa.skill_id = ?
    `, [req.params.skillId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to find teachers.' });
  }
});

module.exports = router;
