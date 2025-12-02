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
  const [codeStep, setCodeStep] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [code, setCode] = useState('');

  const ATTEMPTS_KEY = 'login_attempts';

  const loadAttempts = () => {
    try{ const raw = localStorage.getItem(ATTEMPTS_KEY); return raw ? JSON.parse(raw) : {}; }catch(e){return {};}
  };

  const saveAttempts = (obj) => { try{ localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(obj)); }catch(e){} };

  const handleChange = (e) => setCreds(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // check lockout
    const attempts = loadAttempts();
    const meta = attempts[creds.username] || { failed:0, lockoutUntil:0 };
    if(meta.lockoutUntil && Date.now() < meta.lockoutUntil){
      setError('Too many attempts. Try again later.');
      return;
    }

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
        // successful credentials
        // clear attempts for this user
        const at = loadAttempts(); delete at[creds.username]; saveAttempts(at);

        // if server indicates two-step required, handle it (server may set json.twoStepRequired)
        if(json.twoStepRequired){
          // generate a code (in real app this would be sent by server)
          const c = ('' + Math.floor(100000 + Math.random() * 900000));
          // store pending info in localStorage for demo
          localStorage.setItem('two_step_pending', JSON.stringify({ username: creds.username, code: c, expires: Date.now() + 5*60*1000 }));
          setPendingUser(json.user);
          setCodeStep(true);
          alert('Two-step code (demo): ' + c);
          return;
        }

        // Save token and user
        localStorage.setItem('token', json.token);
        localStorage.setItem('currentUser', JSON.stringify(json.user));
        if (setUser) setUser(json.user);
        navigate('/dashboard');
      } catch (err) {
        console.error('Login network error:', err);
        // increment failed attempts
        const at2 = loadAttempts();
        const m = at2[creds.username] || { failed:0, lockoutUntil:0 };
        m.failed = (m.failed || 0) + 1;
        if(m.failed >= 5){ m.lockoutUntil = Date.now() + 30*1000; m.failed = 0; }
        at2[creds.username] = m; saveAttempts(at2);
        setError('Login failed: ' + (err.message || 'unknown') + '.\nCheck the backend is running and reachable at http://localhost:5000');
      }
    })();
  };

  const verifyCode = (e) => {
    e.preventDefault();
    try{
      const raw = localStorage.getItem('two_step_pending');
      if(!raw){ setError('No pending two-step found'); return; }
      const obj = JSON.parse(raw);
      if(Date.now() > obj.expires){ setError('Code expired'); return; }
      if(code !== obj.code){ setError('Incorrect code'); return; }
      // accept: store token/user that would have been returned earlier
      // NOTE: for demo we expect pendingUser to exist
      if(pendingUser){
        // simulate token
        const fakeToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('currentUser', JSON.stringify(pendingUser));
        if(setUser) setUser(pendingUser);
        localStorage.removeItem('two_step_pending');
        navigate('/dashboard');
        return;
      }
      setError('Unable to complete two-step.');
    }catch(e){ setError('Unable to verify code'); }
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
