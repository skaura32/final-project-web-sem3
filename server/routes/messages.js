const express = require('express');
const router = express.Router();
const { useSql, dbSql, loadJSON, saveJSON, sendServerError, authMiddleware, adminOnly } = require('../lib/common');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Missing fields' });
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const u = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT id FROM Users WHERE student_id=@studentId');
      const userId = u.recordset.length ? u.recordset[0].id : null;
      const insert = await pool.request()
        .input('userId', dbSql.mssql.Int, userId)
        .input('name', dbSql.mssql.NVarChar, req.user.firstName)
        .input('email', dbSql.mssql.NVarChar, req.user.email || '')
        .input('subject', dbSql.mssql.NVarChar, subject)
        .input('message', dbSql.mssql.NVarChar, message)
        .input('is_read', dbSql.mssql.Bit, false)
        .query('INSERT INTO Messages (user_id, name, email, subject, message, is_read) OUTPUT inserted.id AS id, inserted.created_at AS date, inserted.is_read AS is_read VALUES (@userId, @name, @email, @subject, @message, @is_read)');
      const newMsg = { id: `msg_${insert.recordset[0].id}`, studentId: req.user.studentId, name: req.user.firstName, email: req.user.email || '', subject, message, date: insert.recordset[0].date, read: !!insert.recordset[0].is_read };
      return res.json(newMsg);
    }
    const msgs = loadJSON('messages.json') || [];
    const newMsg = { id: `msg_${Date.now()}`, studentId: req.user.studentId, name: req.user.firstName, email: req.user.email || '', subject, message, date: new Date().toISOString(), read: false };
    msgs.push(newMsg);
    saveJSON('messages.json', msgs);
    res.json(newMsg);
  } catch (err) {
    sendServerError(res, err);
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const mine = (req.query.mine === 'true' || req.query.mine === true);
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      if (req.user.isAdmin && !mine) {
        const r = await pool.request().query('SELECT m.id, u.student_id AS studentId, m.name, m.email, m.subject, m.message, m.created_at AS date, m.is_read AS is_read FROM Messages m LEFT JOIN Users u ON m.user_id=u.id');
        return res.json(r.recordset.map(r2 => ({ id: `msg_${r2.id}`, studentId: r2.studentId, name: r2.name, email:r2.email, subject: r2.subject, message: r2.message, date: r2.date, read: !!r2.is_read })));
      }
      const r = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT m.id, u.student_id AS studentId, m.name, m.email, m.subject, m.message, m.created_at AS date, m.is_read AS is_read FROM Messages m LEFT JOIN Users u ON m.user_id=u.id WHERE u.student_id=@studentId');
      return res.json(r.recordset.map(r2 => ({ id: `msg_${r2.id}`, studentId: r2.studentId, name: r2.name, email:r2.email, subject: r2.subject, message: r2.message, date: r2.date, read: !!r2.is_read })));
    }
    const msgs = loadJSON('messages.json') || [];
    if (req.user.isAdmin && !mine) return res.json(msgs);
    return res.json(msgs.filter(m => m.studentId === req.user.studentId));
  } catch (err) {
    sendServerError(res, err);
  }
});

router.put('/:id/read', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const numericId = id.startsWith('msg_') ? parseInt(id.slice(4)) : parseInt(id);
      const r = await pool.request().input('id', dbSql.mssql.Int, numericId).query('UPDATE Messages SET is_read=1 OUTPUT inserted.id, inserted.user_id, inserted.name, inserted.email, inserted.subject, inserted.message, inserted.created_at AS date, inserted.is_read AS is_read WHERE id=@id');
      if (!r.recordset || !r.recordset.length) return res.status(404).json({ message: 'Not found' });
      const row = r.recordset[0];
      const u = await pool.request().input('userId', dbSql.mssql.Int, row.user_id).query('SELECT student_id AS studentId FROM Users WHERE id=@userId');
      const studentId = (u.recordset[0] && u.recordset[0].studentId) || null;
      return res.json({ id: `msg_${row.id}`, studentId, name: row.name, email: row.email, subject: row.subject, message: row.message, date: row.date, read: !!row.is_read });
    }
    const msgs = loadJSON('messages.json') || [];
    const idx = msgs.findIndex(m => m.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    msgs[idx].read = true;
    saveJSON('messages.json', msgs);
    res.json(msgs[idx]);
  } catch (err) {
    sendServerError(res, err);
  }
});

module.exports = router;
