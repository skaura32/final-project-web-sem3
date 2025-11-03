import React, { useEffect, useState } from 'react';

function loadUsers() {
  try {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AdminStudents() {
  const admin = JSON.parse(localStorage.getItem('currentUser'));
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  if (!admin || !admin.isAdmin) {
    return <div className="signup-container"><h2>Admin Only</h2></div>;
  }

  const studentsByProgram = users.filter(u => !u.isAdmin).reduce((acc, u) => {
    acc[u.program] = acc[u.program] || [];
    acc[u.program].push(u);
    return acc;
  }, {});

  return (
    <div className="signup-container">
      <h2>Registered Students by Program</h2>
      {Object.keys(studentsByProgram).length === 0 && <p>No students registered.</p>}
      {Object.entries(studentsByProgram).map(([program, students]) => (
        <div key={program} style={{ marginBottom: 10 }}>
          <strong>{program}</strong>
          <ul style={{ marginLeft: 16 }}>
            {students.map(s => (
              <li key={s.studentId}>{s.firstName} {s.lastName} ({s.email})</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}