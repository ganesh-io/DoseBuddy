const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/dashboard/student/:id
router.get('/student/:id', auth, async (req, res) => {
  try {
    const stId = req.params.id;

    const [[skillCount], [certCount], [projectCount], [internCount], [appCount]] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM student_skill WHERE st_id = ?', [stId]),
      pool.query('SELECT COUNT(*) as count FROM certificate WHERE st_id = ?', [stId]),
      pool.query('SELECT COUNT(*) as count FROM project WHERE st_id = ?', [stId]),
      pool.query('SELECT COUNT(*) as count FROM student_intern WHERE st_id = ?', [stId]),
      pool.query('SELECT COUNT(*) as count FROM application WHERE st_id = ?', [stId]),
    ]);

    // Recent activity: UNION of applications + exchange requests
    const [recentActivity] = await pool.query(`
      (SELECT 'application' as type, a.role as title, c.company_name as subtitle, a.applied_at as timestamp
       FROM application a JOIN company c ON a.company_id = c.company_id
       WHERE a.st_id = ? ORDER BY a.applied_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'exchange' as type, s1.skill_name as title, s2.skill_name as subtitle, ser.created_at as timestamp
       FROM skill_exchange_request ser
       JOIN skill s1 ON ser.skill_wanted = s1.skill_id
       JOIN skill s2 ON ser.skill_offered = s2.skill_id
       WHERE ser.requester_id = ? ORDER BY ser.created_at DESC LIMIT 5)
      ORDER BY timestamp DESC LIMIT 10
    `, [stId, stId]);

    // Application statuses
    const [applications] = await pool.query(`
      SELECT a.app_id, a.role, a.status, a.applied_at, c.company_name
      FROM application a JOIN company c ON a.company_id = c.company_id
      WHERE a.st_id = ? ORDER BY a.applied_at DESC
    `, [stId]);

    // Shortlist status
    const [shortlists] = await pool.query(`
      SELECT s.status, s.interview_date, c.company_name
      FROM shortlist s JOIN company c ON s.company_id = c.company_id
      WHERE s.st_id = ?
    `, [stId]);

    res.json({
      stats: {
        skills: skillCount[0].count,
        certificates: certCount[0].count,
        projects: projectCount[0].count,
        internships: internCount[0].count,
        applications: appCount[0].count,
      },
      recentActivity,
      applications,
      shortlists,
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

// GET /api/dashboard/recruiter/:id
router.get('/recruiter/:id', auth, async (req, res) => {
  try {
    const recId = req.params.id;

    const [[shortlistedCount], [selectedCount]] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM shortlist WHERE shortlisted_by = ?', [recId]),
      pool.query("SELECT COUNT(*) as count FROM shortlist WHERE shortlisted_by = ? AND status = 'Selected'", [recId]),
    ]);

    // Get openings for recruiter's company
    const [recruiter] = await pool.query('SELECT company_name FROM recruiter WHERE rec_id = ?', [recId]);
    let openingsCount = 0;
    if (recruiter.length > 0) {
      const [openings] = await pool.query(
        'SELECT COUNT(*) as count FROM company_opening co JOIN company c ON co.company_id = c.company_id WHERE c.company_name = ?',
        [recruiter[0].company_name]
      );
      openingsCount = openings[0].count;
    }

    res.json({
      stats: {
        shortlisted: shortlistedCount[0].count,
        selected: selectedCount[0].count,
        openings: openingsCount,
      },
    });
  } catch (err) {
    console.error('Recruiter dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

module.exports = router;
