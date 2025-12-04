const express = require('express');
const router = express.Router();
const { bcrypt, jwt, loadJSON, saveJSON, useSql, dbSql, JWT_SECRET, sendServerError, validateRegisterPayload, validateLoginPayload, generateStudentId } = require('../lib/common');

router.post('/register', async (req, res) => {
  const err = validateRegisterPayload(req.body);
  if (err) return res.status(400).json({ message: err });
  const { firstName, lastName, email, username, password, program, role = 'student' } = req.body;
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const dup = await pool.request().input('username', dbSql.mssql.NVarChar, username).input('email', dbSql.mssql.NVarChar, email).query('SELECT id FROM Users WHERE username=@username OR email=@email');
      if (dup.recordset.length) return res.status(409).json({ message: 'Username or email already registered' });
      const hashed = bcrypt.hashSync(password, 10);
      const studentId = 'BVC' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const insert = await pool.request()
        .input('studentId', dbSql.mssql.NVarChar, studentId)
        .input('username', dbSql.mssql.NVarChar, username)
        .input('email', dbSql.mssql.NVarChar, email)
        .input('password', dbSql.mssql.NVarChar, hashed)
        .input('firstName', dbSql.mssql.NVarChar, firstName)
        .input('lastName', dbSql.mssql.NVarChar, lastName)
        .input('program', dbSql.mssql.NVarChar, program)
        .input('isAdmin', dbSql.mssql.Bit, role === 'admin' ? 1 : 0)
        .query('INSERT INTO Users (student_id, username, email, password, first_name, last_name, program, is_admin) OUTPUT inserted.id AS id VALUES (@studentId, @username, @email, @password, @firstName, @lastName, @program, @isAdmin);');
      const id = insert.recordset[0].id;
      const token = jwt.sign({ id, username, studentId, isAdmin: role === 'admin', firstName }, JWT_SECRET, { expiresIn: '7d' });
      const sanitized = { id, studentId, username, email, firstName, lastName, program, isAdmin: role === 'admin' };
      return res.json({ user: sanitized, token });
    } else {
      const users = loadJSON('users.json') || [];
      if (users.find(u => u.username === username)) return res.status(409).json({ message: 'Username already exists' });
      if (users.find(u => u.email === email)) return res.status(409).json({ message: 'Email already registered' });
      const existingIds = new Set(users.map(u => u.studentId));
      const studentId = generateStudentId(existingIds);
      const hashed = bcrypt.hashSync(password, 10);
      const id = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
      const newUser = { id, studentId, username, email, firstName, lastName, password: hashed, program: program || '', isAdmin: role === 'admin' };
      users.push(newUser);
      saveJSON('users.json', users);
      const token = jwt.sign({ id: newUser.id, username: newUser.username, studentId: newUser.studentId, isAdmin: newUser.isAdmin, firstName: newUser.firstName, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      const sanitized = { ...newUser }; delete sanitized.password;
      return res.json({ user: sanitized, token });
    }
  } catch (err) {
    sendServerError(res, err);
  }
});

router.post('/login', async (req, res) => {
  const err = validateLoginPayload(req.body);
  if (err) return res.status(400).json({ message: err });
  try {
    const { username, password } = req.body;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const result = await pool.request().input('username', dbSql.mssql.NVarChar, username).query('SELECT id, student_id AS studentId, username, email, password, first_name AS firstName, last_name AS lastName, is_admin AS isAdmin, program FROM Users WHERE username=@username OR email=@username');
      const user = result.recordset[0];
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
      if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, username: user.username, studentId: user.studentId, isAdmin: user.isAdmin, firstName: user.firstName, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      const sanitized = { id: user.id, username: user.username, studentId: user.studentId, email: user.email, firstName: user.firstName, lastName: user.lastName, program: user.program, isAdmin: user.isAdmin };
      return res.json({ user: sanitized, token });
    }
    const users = loadJSON('users.json') || [];
    const user = users.find(u => u.email === username || u.username === username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, studentId: user.studentId, isAdmin: user.isAdmin, firstName: user.firstName, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const sanitized = { ...user }; delete sanitized.password;
    return res.json({ user: sanitized, token });
  } catch (err) {
    sendServerError(res, err);
  }
});

module.exports = router;
