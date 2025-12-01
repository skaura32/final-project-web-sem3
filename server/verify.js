const fetch = require('node-fetch');
const assert = require('assert');

const base = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { json = null; }
  return { ok: res.ok, status: res.status, text, json };
}

async function get(path, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + path, { headers });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

async function run() {
  console.log('Verifying backend at', base);
  // registration
  const username = 'auto_' + Math.floor(Math.random()*10000);
  const register = await post('/api/auth/register', { firstName: 'Auto', lastName: 'Tester', email: `${username}@example.com`, username, password: 'pass1234', role: 'student', program: 'SD' });
  assert(register.ok, 'Register failed: ' + (register.text || register.status));
  console.log('Register OK:', username);
  const token = register.json.token;
  assert(token, 'No token returned');

  // login
  const login = await post('/api/auth/login', { username, password: 'pass1234' });
  assert(login.ok, 'Login failed');
  const token2 = login.json.token;
  console.log('Login OK');

  // list courses
  const courses = await get('/api/courses', token2);
  assert(Array.isArray(courses.json), 'Courses not array');
  console.log(`Courses returned: ${courses.json.length}`);

  // search
  const qres = await get('/api/courses?q=web', token2);
  console.log('Search returned', (qres.json && qres.json.length) || 0);

  // register for courses
  const body = { term: 'Fall', courses: [courses.json[0].courseCode || 'SD101'] };
  const regs = await post('/api/registrations', body, token2);
  assert(regs.ok, 'Registrations failed');
  console.log('Registration saved');

  // read registrations
  const gregs = await get('/api/registrations/Fall', token2);
  assert(gregs.ok, 'Get registraitons failed');
  console.log('Registrations list:', JSON.stringify(gregs.json));

  // messages
  const msg = await post('/api/messages', { subject: 'Test', message: 'Hello' }, token2);
  assert(msg.ok, 'Post message failed');
  console.log('Message posted');
  const mget = await get('/api/messages?mine=true', token2);
  console.log('Messages returned:', (mget.json || []).length);

  console.log('All checks passed');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
