// filepath: src/App.js
import React, { useState, useEffect } from 'react';
import Home from "./components/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar'; 
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Programs from './components/Programs';
import Courses from './components/Courses';
import Contact from './components/Contact';
import AdminDashboard from './components/AdminDashboard';
import AdminCourses from './components/AdminCourses';
import AdminStudents from './components/AdminStudents';
import AdminMessages from './components/AdminMessages';
import AdminProfile from './components/AdminProfile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <div className="App">
      <Router>
        <NavBar user={user} onLogout={handleLogout} />
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/" element={
              <div style={{ padding: 20 }}>
                <h1>Welcome to Bow Valley Course Registration</h1>
                {user && user.isAdmin && (
                  <div style={{ marginTop: 16 }}>
                    <strong>Welcome, {user.firstName} (Admin)</strong>
                  </div>
                )}
                {!user && <p>Please login or sign up to register for courses.</p>}
              </div>
            } />
            <Route path="/signup" element={<SignUp setUser={setUser} />} />
           <Route path="/" element={<Home />} />
           <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
