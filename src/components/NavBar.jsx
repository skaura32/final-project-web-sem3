import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar({ user, onLogout }) {
  return (
    <nav>
      <ul className="nav-list">
        <li><Link to="/">Home</Link></li>
        {!user && (
          <>
            <li><Link to="/programs">Programs</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">SignUp</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </>
        )}
        {user && !user.isAdmin && (
          <>
            <li><Link to="/programs">Programs</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><button className="nav-btn" onClick={onLogout}>Logout</button></li>
          </>
        )}
        {user && user.isAdmin && (
            <>
            <li><Link to="/admin/courses">Manage Courses</Link></li>
            <li><Link to="/admin/students">Registered Students</Link></li>
            <li><Link to="/admin/messages">Contact Forms</Link></li>
            <li><Link to="/admin/profile">Profile</Link></li>
            <li><button className="nav-btn" onClick={onLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
}