require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadJSON, saveJSON } = require('./utils/db');
let useSql = (process.env.DB_USE_SQL === 'true' || !!process.env.DB_SERVER || !!process.env.DB_NAME);
let dbSql = null;
if (useSql) {
  try {
    dbSql = require('./db-sql');
  } catch (e) {
    console.warn('SQL support requested but db-sql.js failed to load', e.message);
    useSql = false;
  }
}
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Ensure base JSON files exist and create an admin user if needed
function ensureData() {
  const users = loadJSON('users.json') || [];
  if (!users.find(u => u.username === 'admin')) {
    const hash = bcrypt.hashSync('adminpass', 10);
    users.push({ id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@bowvalley.ca', username: 'admin', password: hash, studentId: 'BVCADMIN', isAdmin: true });
    saveJSON('users.json', users);
  }
  if (loadJSON('courses.json') === null) saveJSON('courses.json', []);
  if (loadJSON('programs.json') === null) saveJSON('programs.json', []);
  if (loadJSON('messages.json') === null) saveJSON('messages.json', []);
  if (loadJSON('registrations.json') === null) saveJSON('registrations.json', {});
}

ensureData();

function sendServerError(res, err) {
  console.error(err);
  return res.status(500).json({ message: 'Server error' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
}

function isEmail(email) {
  return typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
function validateRegisterPayload(body) {
  const { firstName, lastName, email, username, password } = body || {};
  if (!firstName || !lastName) return 'First name and last name are required';
  if (!email || !isEmail(email)) return 'A valid email is required';
  if (!username || username.trim().length < 3) return 'Username must be at least 3 characters';
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  return null;
}
function validateLoginPayload(body) {
  const { username, password } = body || {};
  if (!username || !password) return 'Username and password are required';
  return null;
}

function generateStudentId(existing) {
  let id;
  do { id = 'BVC' + Math.random().toString(36).slice(2, 8).toUpperCase(); } while (existing.has(id));
  return id;
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Bow Valley Course Registration API is running', env: process.env.NODE_ENV || 'development' });
});

app.post('/api/auth/register', async (req, res) => {
  const err = validateRegisterPayload(req.body);
  if (err) return res.status(400).json({ message: err });
  const { firstName, lastName, email, username, password, program, role = 'student' } = req.body;
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      // check duplicates
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

app.post('/api/auth/login', async (req, res) => {
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

app.get('/api/programs', async (req, res) => {
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const result = await pool.request().query('SELECT * FROM Programs');
      return res.json(result.recordset);
    }
    const programs = loadJSON('programs.json') || [];
    res.json(programs);
  } catch (err) {
    sendServerError(res, err);
  }
});

app.get('/api/courses', async (req, res) => {
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

app.get('/api/courses/:code', async (req, res) => {
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

app.get('/api/users/me', authMiddleware, async (req, res) => {
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

app.get('/api/registrations', authMiddleware, async (req, res) => {
  try {
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const r = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT c.course_code AS courseCode, e.term, e.status FROM Enrollments e JOIN Users u ON e.user_id=u.id JOIN Courses c ON e.course_id=c.id WHERE u.student_id=@studentId');
      // reshape into { term: [courseCode] }
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

app.get('/api/registrations/:term', authMiddleware, async (req, res) => {
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

app.post('/api/registrations', authMiddleware, async (req, res) => {
  try {
    const { term, courses } = req.body;
    if (!term || !Array.isArray(courses)) return res.status(400).json({ message: 'Invalid payload' });
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      // find user id
      const u = await pool.request().input('studentId', dbSql.mssql.NVarChar, req.user.studentId).query('SELECT id FROM Users WHERE student_id=@studentId');
      if (!u.recordset.length) return res.status(400).json({ message: 'User not found' });
      const userId = u.recordset[0].id;
      // We will remove existing enrollments for the term and re-insert
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

app.delete('/api/registrations/:term', authMiddleware, async (req, res) => {
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

app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Missing fields' });
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      // find user id
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

app.get('/api/messages', authMiddleware, async (req, res) => {
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

app.put('/api/messages/:id/read', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (useSql && dbSql) {
      const pool = await dbSql.getPool();
      const numericId = id.startsWith('msg_') ? parseInt(id.slice(4)) : parseInt(id);
      const r = await pool.request().input('id', dbSql.mssql.Int, numericId).query('UPDATE Messages SET is_read=1 OUTPUT inserted.id, inserted.user_id, inserted.name, inserted.email, inserted.subject, inserted.message, inserted.created_at AS date, inserted.is_read AS is_read WHERE id=@id');
      if (!r.recordset || !r.recordset.length) return res.status(404).json({ message: 'Not found' });
      const row = r.recordset[0];
      // get studentId via user_id
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

app.get('/api/users', authMiddleware, async (req, res) => {
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

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`Backend running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`));
