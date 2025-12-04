require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Use shared helpers from lib/common
const common = require('./lib/common');
const { bcrypt, jwt, loadJSON, saveJSON, useSql, dbSql, JWT_SECRET, sendServerError, authMiddleware, adminOnly, validateRegisterPayload, validateLoginPayload, generateStudentId } = common;

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

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Bow Valley Course Registration API is running', env: process.env.NODE_ENV || 'development' });
});
// Mount modular routes
const authRoutes = require('./routes/auth');
const programsRoutes = require('./routes/programs');
const coursesRoutes = require('./routes/courses');
const usersRoutes = require('./routes/users');
const registrationsRoutes = require('./routes/registrations');
const messagesRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/messages', messagesRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
// If running in production, serve the React build from the parent directory's `build` folder
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API endpoint not found' });
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, HOST, () => console.log(`Backend running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`));
