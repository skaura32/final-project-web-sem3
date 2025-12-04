const express = require('express');
const router = express.Router();
const { useSql, dbSql, loadJSON, saveJSON, sendServerError, authMiddleware } = require('../lib/common');

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const r = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT c.course_code AS courseCode, e.term, e.status FROM Enrollments e JOIN Users u ON e.user_id=u.id JOIN Courses c ON e.course_id=c.id WHERE u.student_id=@studentId');
      const grouped = {};
      r.recordset.forEach(row => { grouped[row.term] = grouped[row.term] || []; grouped[row.term].push(row.courseCode); });
      return res.json(grouped);
    }
    const regs = loadJSON('registrations.json') || {};
    const sid = req.user.studentId;
    res.json(regs[sid] || {});
  } catch (err) {
    sendServerError(res, err);
  }
});

router.get('/:term', authMiddleware, async (req, res) => {
  try {
    const term = req.params.term;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const r = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).input('term', dbSql.mssql.NVarChar, term).query('SELECT c.course_code AS courseCode FROM Enrollments e JOIN Users u ON e.user_id=u.id JOIN Courses c ON e.course_id=c.id WHERE u.student_id=@studentId AND e.term=@term');
      return res.json(r.recordset.map(r2 => r2.courseCode));
    }
    const regs = loadJSON('registrations.json') || {};
    const sid = req.user.studentId;
    const studentRegs = regs[sid] || {};
    res.json(studentRegs[term] || []);
  } catch (err) {
    sendServerError(res, err);
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { term, courses } = req.body;
    if (!term || !Array.isArray(courses)) return res.status(400).json({ message: 'Invalid payload' });
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const u = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT id FROM Users WHERE student_id=@studentId');
      if (!u.recordset.length) return res.status(400).json({ message: 'User not found' });
      const userId = u.recordset[0].id;
      await pool.request().input('userId', dbSql.mssql.Int, userId).input('term', dbSql.mssql.NVarChar, term).query('DELETE FROM Enrollments WHERE user_id=@userId AND term=@term');
      for (const code of courses) {
        const c = await pool.request().input('code', dbSql.mssql.NVarChar, code).query('SELECT id FROM Courses WHERE course_code=@code');
        if (c.recordset.length) {
          await pool.request().input('userId', dbSql.mssql.Int, userId).input('courseId', dbSql.mssql.Int, c.recordset[0].id).input('term', dbSql.mssql.NVarChar, term).query("INSERT INTO Enrollments (user_id, course_id, term, status) VALUES (@userId, @courseId, @term, 'active')");
        }
      }
      return res.json({ message: 'Saved' });
    }
    const regs = loadJSON('registrations.json') || {};
    const sid = req.user.studentId;
    regs[sid] = regs[sid] || {};
    regs[sid][term] = courses;
    saveJSON('registrations.json', regs);
    res.json({ message: 'Saved' });
  } catch (err) {
    sendServerError(res, err);
  }
});

router.delete('/:term', authMiddleware, async (req, res) => {
  try {
    const term = req.params.term;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const u = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT id FROM Users WHERE student_id=@studentId');
      if (!u.recordset.length) return res.status(404).json({ message: 'Not found' });
      const userId = u.recordset[0].id;
      await pool.request().input('userId', dbSql.mssql.Int, userId).input('term', dbSql.mssql.NVarChar, term).query('DELETE FROM Enrollments WHERE user_id=@userId AND term=@term');
      return res.json({ message: 'Deleted' });
    }
    const regs = loadJSON('registrations.json') || {};
    const sid = req.user.studentId;
    if (regs[sid] && regs[sid][term]) {
      delete regs[sid][term];
      saveJSON('registrations.json', regs);
      return res.json({ message: 'Deleted' });
    }
    return res.status(404).json({ message: 'Not found' });
  } catch (err) {
    sendServerError(res, err);
  }
});

module.exports = router;
