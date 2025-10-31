import React, { useState, useEffect } from 'react';
import '../App.css';

function loadMessages() {
  try {
    const raw = localStorage.getItem('messages');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs) {
  localStorage.setItem('messages', JSON.stringify(msgs));
}

export default function Contact() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [myMessages, setMyMessages] = useState([]);

  useEffect(() => {
    if (user) {
      const msgs = loadMessages().filter(m => m.studentId === user.studentId);
      setMyMessages(msgs);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="signup-container contact-container">
        <h2>Contact Admin</h2>
        <p className="muted">You must be logged in as a student to send messages to the admin.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => (window.location.href = '/login')}>Login</button>
          <button className="btn add-btn" onClick={() => (window.location.href = '/signup')}>Sign Up</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('');
    if (!subject.trim() || !body.trim()) {
      setStatus('Please enter subject and message.');
      return;
    }
    const msgs = loadMessages();
    const newMsg = {
      id: `msg_${Date.now()}`,
      studentId: user.studentId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      subject: subject.trim(),
      message: body.trim(),
      date: new Date().toISOString(),
      read: false
    };
    msgs.push(newMsg);
    saveMessages(msgs);
    setStatus('Message sent to admin.');
    setSubject('');
    setBody('');
    setMyMessages(prev => [newMsg, ...prev]);
  };

  return (
    <div className="signup-container contact-container">
      <h2>Contact Admin</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <textarea
            placeholder="Your message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #ddd' }}
            required
          />
        </div>

        <button type="submit">Send Message</button>
      </form>

      {status && <div className={`message ${status.includes('sent') ? 'success' : 'error'}`} style={{ marginTop: 12 }}>{status}</div>}

      <div style={{ marginTop: 20 }}>
        <h4>Your messages</h4>
        {myMessages.length === 0 && <p className="muted">No messages yet.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {myMessages.map(m => (
            <li key={m.id} className="course-item" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.subject}</div>
                  <div style={{ color: '#374151' }}>{m.message}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(m.date).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: m.read ? '#065f46' : '#9b1c1c' }}>{m.read ? 'Read' : 'Unread'}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}