const express = require('express');
const router = express.Router();
const { useSql, dbSql, loadJSON, sendServerError } = require('../lib/common');

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const program = req.query.program;
    const term = req.query.term;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const request = pool.request();
      let sql = 'SELECT * FROM Courses WHERE 1=1';
      if (q) {
        sql += ' AND (LOWER(course_code) LIKE @q OR LOWER(name) LIKE @q OR LOWER(description) LIKE @q)';
        request.input('q', dbSql.mssql.NVarChar, '%' + q.toLowerCase() + '%');
      }
      if (program) { sql += ' AND LOWER(program)=@program'; request.input('program', dbSql.mssql.NVarChar, (program || '').toLowerCase()); }
      if (term) { sql += ' AND LOWER(term)=@term'; request.input('term', dbSql.mssql.NVarChar, (term || '').toLowerCase()); }
      const result = await request.query(sql);
      return res.json(result.recordset);
    }
    let courses = loadJSON('courses.json') || [];
    const qLower = (q || '').toLowerCase();
    if (qLower) {
      courses = courses.filter(c => ((c.courseCode || '') + ' ' + (c.name || '') + ' ' + (c.description || '')).toLowerCase().includes(qLower));
    }
    if (program) courses = courses.filter(c => (c.program || '').toLowerCase() === (program || '').toLowerCase());
    if (term) courses = courses.filter(c => (c.term || '').toLowerCase() === (term || '').toLowerCase());
    res.json(courses);
  } catch (err) {
    sendServerError(res, err);
  }
});

router.get('/:code', async (req, res) => {
  try {
    const code = req.params.code;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const r = await pool.request().input('code', dbSql.mssql.NVarChar, code).query('SELECT * FROM Courses WHERE LOWER(course_code)=LOWER(@code)');
      const course = r.recordset[0];
      if (!course) return res.status(404).json({ message: 'Course not found' });
      return res.json(course);
    }
    const codeVal = (req.params.code || '').toLowerCase();
    const courses = loadJSON('courses.json') || [];
    const course = courses.find(c => (c.courseCode || '').toLowerCase() === codeVal);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.json(course);
  } catch (err) {
    sendServerError(res, err);
  }
});

module.exports = router;
