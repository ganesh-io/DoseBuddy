const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/student/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      (SELECT sm.*, ser.requester_id, ser.skill_wanted, ser.skill_offered,
        sw.skill_name as wanted_name, so.skill_name as offered_name,
        s.name as partner_name, 'requester' as my_role
       FROM skill_match sm
       JOIN skill_exchange_request ser ON sm.req_id = ser.req_id
       JOIN skill sw ON ser.skill_wanted = sw.skill_id
       JOIN skill so ON ser.skill_offered = so.skill_id
       JOIN student s ON sm.matched_with = s.st_id
       WHERE ser.requester_id = ?)
      UNION
      (SELECT sm.*, ser.requester_id, ser.skill_wanted, ser.skill_offered,
        sw.skill_name as wanted_name, so.skill_name as offered_name,
        s.name as partner_name, 'matched' as my_role
       FROM skill_match sm
       JOIN skill_exchange_request ser ON sm.req_id = ser.req_id
       JOIN skill sw ON ser.skill_wanted = sw.skill_id
       JOIN skill so ON ser.skill_offered = so.skill_id
       JOIN student s ON ser.requester_id = s.st_id
       WHERE sm.matched_with = ?)
      ORDER BY session_date DESC
    `, [req.params.id, req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { req_id, requester_id, matched_with, session_date, session_time, mode, meet_link, skill_wanted, skill_offered } = req.body;

    if (!matched_with) return res.status(400).json({ error: 'matched_with is required' });

    // Smart duplicate check: only block if a SCHEDULED match already exists between these two
    let resolvedReqId = req_id;

    if (resolvedReqId) {
      // Check for existing scheduled match on this req_id with same partner
      const [dup] = await pool.query(
        `SELECT COUNT(*) as cnt FROM skill_match 
         WHERE req_id = ? AND matched_with = ? AND status = 'Scheduled'`,
        [resolvedReqId, matched_with]
      );
      if (dup[0].cnt > 0) {
        return res.status(409).json({ error: 'Already have a scheduled session with this student' });
      }
    } else if (requester_id) {
      // Find or create a matching exchange request
      const [existing] = await pool.query(
        `SELECT req_id FROM skill_exchange_request WHERE requester_id = ? LIMIT 1`,
        [requester_id]
      );
      if (existing.length > 0) {
        resolvedReqId = existing[0].req_id;
        // Check duplicate for this req
        const [dup] = await pool.query(
          `SELECT COUNT(*) as cnt FROM skill_match sm
           JOIN skill_exchange_request ser ON sm.req_id = ser.req_id
           WHERE sm.matched_with = ? AND ser.requester_id = ? AND sm.status = 'Scheduled'`,
          [matched_with, requester_id]
        );
        if (dup[0].cnt > 0) {
          return res.status(409).json({ error: 'Already have a scheduled session with this student' });
        }
      } else {
        // Auto-create a request entry
        resolvedReqId = 'REQ' + Date.now().toString(36).toUpperCase();
        await pool.query(
          'INSERT INTO skill_exchange_request (req_id, requester_id, skill_wanted, skill_offered) VALUES (?, ?, ?, ?)',
          [resolvedReqId, requester_id, skill_wanted || null, skill_offered || null]
        );
      }
    } else {
      return res.status(400).json({ error: 'req_id or requester_id is required' });
    }

    const match_id = 'M' + Date.now();
    try {
      await pool.query(
        'INSERT INTO skill_match (match_id, req_id, matched_with, session_date, session_time, mode, meet_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [match_id, resolvedReqId, matched_with, session_date || null, session_time || null, mode || 'Online', meet_link || null]
      );
    } catch (insertErr) {
      // meet_link column may not exist — retry without it
      await pool.query(
        'INSERT INTO skill_match (match_id, req_id, matched_with, session_date, session_time, mode) VALUES (?, ?, ?, ?, ?, ?)',
        [match_id, resolvedReqId, matched_with, session_date || null, session_time || null, mode || 'Online']
      );
    }
    await pool.query("UPDATE skill_exchange_request SET status = 'Matched' WHERE req_id = ?", [resolvedReqId]);
    res.status(201).json({ message: 'Session proposed!', match_id });
  } catch (err) {
    console.error('Create match error:', err);
    res.status(500).json({ error: 'Failed to create match.' });
  }
});

router.put('/:matchId', auth, async (req, res) => {
  try {
    const { status, session_date, session_time } = req.body;
    let query = 'UPDATE skill_match SET status = COALESCE(?, status)';
    const params = [status];
    if (session_date) { query += ', session_date = ?'; params.push(session_date); }
    if (session_time) { query += ', session_time = ?'; params.push(session_time); }
    query += ' WHERE match_id = ?';
    params.push(req.params.matchId);
    await pool.query(query, params);
    res.json({ message: 'Match updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match.' });
  }
});

module.exports = router;
