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

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setCreds(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = loadUsers();
    const user = users.find(u => u.username === creds.username && u.password === creds.password);
    if (!user) {
      setError('Invalid username or password');
      return;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (setUser) setUser(user);
    navigate('/dashboard');
  };

  return (
    <div className="signup-container">
      <h2>Login</h2>
      {error && <div className="message error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input name="username" placeholder="Username" value={creds.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input name="password" type="password" placeholder="Password" value={creds.password} onChange={handleChange} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
