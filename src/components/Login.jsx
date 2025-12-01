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
    setError('');
    (async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: creds.username, password: creds.password }),
        });
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch (e) { json = null; }
        if (!res.ok) {
          if (json && json.message) setError(json.message);
          else if (text && text.trim().startsWith('<')) setError('Login failed: received HTML (is backend not running?)');
          else setError(text || 'Login failed');
          return;
        }
        if (!json) {
          setError('Login failed: server returned non-JSON response. Check backend is running and proxy is configured');
          console.error('Login: non-JSON response:', text);
          return;
        }
        // Save token and user
        localStorage.setItem('token', json.token);
        localStorage.setItem('currentUser', JSON.stringify(json.user));
        if (setUser) setUser(json.user);
        navigate('/dashboard');
      } catch (err) {
        console.error('Login network error:', err);
        setError('Login failed: ' + (err.message || 'unknown') + '.\nCheck the backend is running and reachable at http://localhost:5000');
      }
    })();
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
