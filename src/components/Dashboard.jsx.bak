// filepath: src/components/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const [showProfile, setShowProfile] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

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
    </div>
  );
}
