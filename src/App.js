import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { programs, courses as initialCourses, sampleMessages } from './data';

const STORAGE_KEY = 'bow_a1_state_v1';

function App(){
  const navigate = useNavigate();
  const [state, setState] = useState(()=>{
   
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return {
      users: [], // {email,username,password,program,isAdmin,registeredCourses,phone,birthday}
      courses: initialCourses,
      programs: programs,
      messages: sampleMessages
    };
  });

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const registerUser = (user) => {
    setState(prev=>({ ...prev, users: [...prev.users, user] }));
    return user;
  };

  const login = (username, password) => {
    const found = state.users.find(u => u.username === username && u.password === password);
    if(found) return found;
    return null;
  };

  const addCourse = (course) => {
    setState(prev=>({ ...prev, courses: [...prev.courses, course] }));
  };

  const editCourse = (course) => {
    setState(prev=>({ ...prev, courses: prev.courses.map(c=> c.id === course.id ? course : c) }));
  };

  const deleteCourse = (courseId) => {
    setState(prev=>({ ...prev, courses: prev.courses.filter(c=> c.id !== courseId), users: prev.users.map(u=> ({ ...u, registeredCourses: u.registeredCourses ? u.registeredCourses.filter(rc=> rc !== courseId) : [] })) }));
  };

  const submitMessage = (msg) => {
    setState(prev=>({ ...prev, messages: [...prev.messages, msg] }));
  };

  return (
    <div className="container">
      <header>
        <h1>Bow Course Registration (Frontend - A1)</h1>
        <nav>
          <Link to="/">Home</Link> {' | '}
          <Link to="/signup">Signup</Link> {' | '}
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home programs={state.programs} courses={state.courses} />} />
          <Route path="/signup" element={<Signup programs={state.programs} onRegister={registerUser} navigate={navigate} />} />
          <Route path="/login" element={<Login onLogin={login} navigate={navigate} />} />
          <Route path="/student/:id" element={<StudentDashboard state={state} setState={setState} submitMessage={submitMessage} />} />
          <Route path="/admin/:id" element={<AdminDashboard state={state} addCourse={addCourse} editCourse={editCourse} deleteCourse={deleteCourse} />} />
        </Routes>
      </main>

      <footer>
        <small>Assignment 1 - Frontend (React) - SODV2201</small>
      </footer>
    </div>
  );
}

export default App;
