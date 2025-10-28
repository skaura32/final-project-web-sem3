import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function AdminProfile({ state }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const admin = state.users.find(u => u.id === id && u.isAdmin);

  if (!admin) {
    return <div className="card"><p>Admin profile not found.</p></div>;
  }

  return (
    <div>
      <section className="card topbar">
        <div>
          <h2>Admin Profile</h2>
          <button onClick={() => navigate(-1)}>← Back to Dashboard</button>
        </div>
      </section>

      <section className="card" style={{marginTop: 12}}>
        <h3>Profile Information</h3>
        <div className="profile-details">
          <p><strong>ID:</strong> {admin.id}</p>
          <p><strong>Name:</strong> {admin.firstName} {admin.lastName}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Role:</strong> Administrator</p>
          {admin.phone && <p><strong>Phone:</strong> {admin.phone}</p>}
          {admin.department && <p><strong>Department:</strong> {admin.department}</p>}
          {admin.joinDate && <p><strong>Join Date:</strong> {admin.joinDate}</p>}
        </div>
      </section>
    </div>
  );
}