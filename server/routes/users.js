const express = require('express');
const router = express.Router();
const { useSql, dbSql, loadJSON, sendServerError, authMiddleware } = require('../lib/common');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const r = await pool.request().input('id', dbSql.mssql.Int, req.user.id).query('SELECT id, student_id AS studentId, username, email, first_name AS firstName, last_name AS lastName, phone, birthday, department, program, is_admin AS isAdmin FROM Users WHERE id=@id');
      const user = r.recordset[0];
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    }
    const users = loadJSON('users.json') || [];
    const user = users.find(u => u.id === req.user.id || u.studentId === req.user.studentId || u.username === req.user.username);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const sanitized = { ...user }; delete sanitized.password;
    res.json(sanitized);
  } catch (err) {
    sendServerError(res, err);
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const r = await pool.request().query('SELECT id, student_id AS studentId, username, email, first_name AS firstName, last_name AS lastName, phone, birthday, department, program, is_admin AS isAdmin FROM Users');
      return res.json(r.recordset);
    }
    const users = loadJSON('users.json') || [];
    const safe = users.map(u => { const s = {...u}; delete s.password; return s; });
    res.json(safe);
  } catch (err) {
    sendServerError(res, err);
  }
});

module.exports = router;
