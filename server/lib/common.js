const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { loadJSON, saveJSON } = require('../utils/db');

let useSql = (process.env.DB_USE_SQL === 'true' || !!process.env.DB_SERVER || !!process.env.DB_NAME);
let dbSql = null;
if (useSql) {
  try {
    dbSql = require('../db-sql');
  } catch (e) {
    console.warn('SQL support requested but db-sql.js failed to load', e.message);
    useSql = false;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

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

module.exports = {
  bcrypt,
  jwt,
  path,
  loadJSON,
  saveJSON,
  useSql,
  dbSql,
  JWT_SECRET,
  sendServerError,
  authMiddleware,
  adminOnly,
  isEmail,
  validateRegisterPayload,
  validateLoginPayload,
  generateStudentId
};
