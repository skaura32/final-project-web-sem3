import React from 'react';

export default function AdminProfile() {
  const admin = JSON.parse(localStorage.getItem('currentUser'));
  if (!admin || !admin.isAdmin) return <div className="signup-container"><h2>Admin Only</h2></div>;
  return (
    <div className="signup-container">
      <h2>Admin Profile</h2>
      <div className="info-grid">
        <div className="info-item"><label>Name:</label><span>{admin.firstName} {admin.lastName}</span></div>
        <div className="info-item"><label>Email:</label><span>{admin.email}</span></div>
        <div className="info-item"><label>Username:</label><span>{admin.username}</span></div>
      </div>
    </div>
  );
}