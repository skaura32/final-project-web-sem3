import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function loadUsers() {
  try {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function generateStudentId(existingIds) {
  let id;
  do {
    id = 'BVC' + Math.random().toString(36).slice(2, 8).toUpperCase();
  } while (existingIds.has(id));
  return id;
}

export default function SignUp({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthday: '',
    department: 'SD',
    program: '',
    username: '',
    password: '',
    role: 'student', // 'student' or 'admin'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setForm(prev => ({
      ...prev,
      role: e.target.value,
      // Clear program if switching to admin
      program: e.target.value === 'admin' ? '' : prev.program
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password) {
      setError('Please fill required fields.');
      return;
    }

    // Admin email restriction
    if (form.role === 'admin' && !form.email.endsWith('@bowvalley.ca')) {
      setError('Admin email must end with @bowvalley.ca');
      return;
    }

    // Student must select program
    if (form.role === 'student' && !form.program) {
      setError('Please select a program.');
      return;
    }

    const users = loadUsers();

    // Prevent duplicate username/email
    if (users.find(u => u.username === form.username)) {
      setError('Username already exists.');
      return;
    }
    if (users.find(u => u.email === form.email)) {
      setError('An account with this email already exists.');
      return;
    }

    const existingIds = new Set(users.map(u => u.studentId));
    const studentId = generateStudentId(existingIds);

    const newUser = {
      ...form,
      studentId,
      isAdmin: form.role === 'admin'
    };

    users.push(newUser);
    saveUsers(users);

    // Set currentUser and update app state (if setter provided)
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    if (typeof setUser === 'function') setUser(newUser);

    // Redirect to dashboard or admin dashboard
    if (newUser.isAdmin) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="signup-container">
      <h2>Registration</h2>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            <input
              type="radio"
              name="role"
              value="student"
              checked={form.role === 'student'}
              onChange={handleRoleChange}
            /> Student
          </label>
          <label style={{ marginLeft: 16 }}>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={form.role === 'admin'}
              onChange={handleRoleChange}
            /> Admin
          </label>
        </div>
        <div className="form-group">
          <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <input name="birthday" type="date" value={form.birthday} onChange={handleChange} />
        </div>
        <div className="form-group">
          <select name="department" value={form.department} onChange={handleChange} required>
            <option value="SD">Software Development</option>
          </select>
        </div>
        {/* Only show program if student */}
        {form.role === 'student' && (
          <div className="form-group">
            <select name="program" value={form.program} onChange={handleChange} required>
              <option value="">Select Program</option>
              <option value="diploma">Diploma (2 years)</option>
              <option value="postDiploma">Post-Diploma (1 year)</option>
              <option value="certificate">Certificate (6 months)</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
