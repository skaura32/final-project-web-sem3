import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const [showProfile, setShowProfile] = useState(false);
  const [registrations, setRegistrations] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch (e) { json = null; }
        if (!res.ok) {
          // if token not valid or no user, redirect
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          navigate('/login');
          return;
        }
        if (!json) {
          console.error('GET /api/users/me returned non-JSON:', text);
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          navigate('/login');
          return;
        }
        setUser(json);
        localStorage.setItem('currentUser', JSON.stringify(json));
      } catch (err) {
        navigate('/login');
      }
    })();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/registrations', { headers: { Authorization: `Bearer ${token}` } });
        const text2 = await res.text();
        let json2;
        try { json2 = JSON.parse(text2); } catch (e) { json2 = null; }
        if (res.ok && json2) setRegistrations(json2 || {});
      } catch (err) {
        setRegistrations({});
      }
    })();
  }, []);

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Student Dashboard</h2>
        <button className="view-profile-btn" onClick={() => setShowProfile(s => !s)}>
          {showProfile ? 'Hide Profile' : 'View Profile'}
        </button>
      </div>

      <div className="student-info">
        <h3>Student Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Student ID:</label>
            <span>{user.studentId}</span>
          </div>
          <div className="info-item">
            <label>Name:</label>
            <span>{user.firstName} {user.lastName}</span>
          </div>
          <div className="info-item">
            <label>Department:</label>
            <span>{user.department}</span>
          </div>
          <div className="info-item">
            <label>Program:</label>
            <span>{user.program}</span>
          </div>
          <div className="info-item">
            <label>Status:</label>
            <span>{user.isAdmin ? 'Admin' : 'Student'}</span>
          </div>
        </div>

        {showProfile && (
          <div className="full-profile">
            <h3>Full Profile</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{user.phone}</span>
              </div>
              <div className="info-item">
                <label>Birthday:</label>
                <span>{user.birthday}</span>
              </div>
              <div className="info-item">
                <label>Username:</label>
                <span>{user.username}</span>
              </div>
            </div>

            
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Your Registrations</h3>
        {(!registrations || Object.keys(registrations).length === 0) && (
          <p className="muted">No registrations yet.</p>
        )}
        {Object.entries(registrations).map(([t, courseCodes]) => (
          <div key={t} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0 }}>{t}</h4>
              <button className="btn" onClick={async () => {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/registrations/${t}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) {
                  setRegistrations(prev => { const copy = { ...prev }; delete copy[t]; return copy; });
                }
              }}>Cancel Term</button>
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {courseCodes.map(cc => (
                <li key={cc} style={{ padding: '6px 0' }}>{cc}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
