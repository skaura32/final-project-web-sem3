import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function StudentDashboard({ state, setState, submitMessage }){
  const { id } = useParams();
  const user = state.users.find(u=> u.id === id);
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [contact, setContact] = useState({subject:'', message:''});

  if(!user){
    return <div className="card"><p>User not found. If you just signed up, reload the page.</p></div>
  }

  const coursesForTerm = state.courses.filter(c=> !term || c.term === term).filter(c=> {
    if(!search) return true;
    return c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
  });

  const registerCourse = (courseId) => {
    // enforce 2-5 courses per term (count registered courses that match selected term)
    const course = state.courses.find(c=> c.id === courseId);
    const registered = user.registeredCourses || [];
    const sameTermCount = registered.filter(rcId => {
      const rc = state.courses.find(cc=> cc.id === rcId);
      return rc && rc.term === course.term;
    }).length;
    if(sameTermCount >= 5){
      alert('You cannot register for more than 5 courses in the same term.');
      return;
    }
    if(registered.includes(courseId)){
      alert('Already registered for this course.');
      return;
    }
    const updatedUsers = state.users.map(u=> u.id === user.id ? { ...u, registeredCourses: [...(u.registeredCourses||[]), courseId] } : u);
    setState(prev=> ({ ...prev, users: updatedUsers }));
  };

  const removeCourse = (courseId) => {
    const updatedUsers = state.users.map(u=> u.id === user.id ? { ...u, registeredCourses: (u.registeredCourses||[]).filter(rc=> rc !== courseId) } : u);
    setState(prev=> ({ ...prev, users: updatedUsers }));
  };

  const handleContact = (e) => {
    e.preventDefault();
    if(!contact.subject || !contact.message){
      alert('Please fill subject and message');
      return;
    }
    const msg = { id: 'M' + Date.now(), from: user.email, subject: contact.subject, message: contact.message, date: new Date().toISOString().split('T')[0] };
    submitMessage(msg);
    setContact({subject:'', message:''});
    alert('Message sent to admin.');
  };

  return (
    <div>
      <section className="card topbar">
        <div>
          <h2>Welcome, {user.firstName} {user.lastName}</h2>
          <p className="small">ID: {user.id} | Program: {user.program} | Department: Software Development</p>
        </div>
        <div>
          <button onClick={()=> window.location.href = '/'}>Home</button>
        </div>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Term Selection & Search</h3>
        <div style={{display:'flex', gap:8}}>
          <select value={term} onChange={e=>setTerm(e.target.value)}>
            <option value="">All Terms</option>
            <option>Winter</option>
            <option>Spring</option>
            <option>Summer</option>
            <option>Fall</option>
          </select>
          <input placeholder="Search courses by name or code" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        <h4 style={{marginTop:10}}>Available Courses</h4>
        <div className="grid">
          {coursesForTerm.map(c=> (
            <div key={c.id} className="card">
              <h4>{c.code} — {c.name}</h4>
              <p className="small">Term: {c.term}</p>
              <p>{c.description}</p>
              <div className="actions">
                {(user.registeredCourses||[]).includes(c.id) ? (
                  <button onClick={()=> removeCourse(c.id)}>Remove</button>
                ) : (
                  <button onClick={()=> registerCourse(c.id)}>Add</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Your Registered Courses</h3>
        {(user.registeredCourses && user.registeredCourses.length>0) ? (
          <ul>
            {user.registeredCourses.map(rc=> {
              const c = state.courses.find(cc=> cc.id === rc);
              return <li key={rc}>{c ? c.code + ' - ' + c.name + ' (' + c.term + ')' : rc}</li>
            })}
          </ul>
        ) : <p>No courses registered yet.</p>}
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Contact Admin</h3>
        <form onSubmit={handleContact}>
          <input placeholder="Subject" value={contact.subject} onChange={e=>setContact({...contact, subject: e.target.value})} />
          <textarea placeholder="Message" value={contact.message} onChange={e=>setContact({...contact, message: e.target.value})} />
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
}
