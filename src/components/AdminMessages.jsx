import React, { useEffect, useState } from 'react';

function loadMessages() {
  try {
    const raw = localStorage.getItem('messages');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AdminMessages() {
  const admin = JSON.parse(localStorage.getItem('currentUser'));
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  if (!admin || !admin.isAdmin) {
    return <div className="signup-container"><h2>Admin Only</h2></div>;
  }

  return (
    <div className="signup-container">
      <h2>Submitted Contact Forms</h2>
      {messages.length === 0 && <p>No messages submitted.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map(m => (
          <li key={m.id} className="course-item" style={{ marginBottom: 10 }}>
            <div>
              <strong>{m.subject}</strong> from {m.name} ({m.email})<br />
              <span style={{ color: '#374151' }}>{m.message}</span>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(m.date).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}