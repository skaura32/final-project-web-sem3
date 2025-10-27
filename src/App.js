import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
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
      , currentUser: null
    };
  });

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const registerUser = (user) => {
    setState(prev=>({ ...prev, users: [...prev.users, user], currentUser: user }));
    return user;
  };

  const login = (username, password) => {
    const found = state.users.find(u => u.username === username && u.password === password);
    if(found){
      setState(prev=>({ ...prev, currentUser: found }));
      return found;
    }
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

  const location = useLocation();

  return (
    <div className="container">
      <header>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <h1 style={{margin:0}}>BVC Course Registration</h1>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8, marginLeft:32}}>
            {location.pathname === '/profile' ? (
              // on profile page show back and home buttons
              <>
                <button onClick={()=> navigate(-1)} title="Back" style={{padding:'6px 10px', borderRadius:6, cursor:'pointer'}}>← Prev</button>
                <button onClick={()=> navigate('/')} title="Home" style={{padding:'6px 10px', borderRadius:6, cursor:'pointer'}}>Home</button>
              </>
            ) : (
              state.currentUser ? (
                // profile icon/button on the top-right (pushed right)
                <div style={{marginLeft:20}}>
                  <button onClick={()=> navigate('/profile')} style={{padding:'6px 10px', borderRadius:6, cursor:'pointer'}} title="Profile">
                    {state.currentUser.profilePic ? (
                      <img src={state.currentUser.profilePic} alt="profile" style={{width:28, height:28, borderRadius:'50%', verticalAlign:'middle', marginRight:8}} />
                    ) : '👤 '}
                    {state.currentUser.firstName || state.currentUser.username}
                  </button>
                </div>
              ) : (
                // when not logged in show login and signup links
                <nav>
                  <Link to="/login">Login</Link> {' | '}
                  <Link to="/signup">Signup</Link>
                </nav>
              )
            )}
            {state.currentUser && state.currentUser.isAdmin && location.pathname !== '/profile' && (
              <div style={{marginLeft:8}}>
                <button onClick={()=> navigate('/admin/' + state.currentUser.id)} style={{padding:'6px 10px', borderRadius:6, cursor:'pointer'}}>Admin Panel</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home programs={state.programs} courses={state.courses} />} />
          <Route path="/signup" element={<Signup programs={state.programs} onRegister={registerUser} navigate={navigate} />} />
          <Route path="/login" element={<Login onLogin={login} navigate={navigate} />} />
          <Route path="/profile" element={<Profile state={state} setState={setState} navigate={navigate} />} />
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
