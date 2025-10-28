import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateCourseId } from '../data';

export default function AdminDashboard({ state, addCourse, editCourse, deleteCourse }){
  // support both /admin/:id and /admin/:adminNumber routes
  const { id, adminNumber } = useParams();
  const lookupKey = adminNumber || id;
  const navigate = useNavigate();

  // currently authenticated user id in app state (adjust if your state uses a different prop)
  const currentUserId = state.currentUserId || state.currentUser?.id || null;
  const currentUser = state.users.find(u => u.id === currentUserId);

  // find target admin by adminNumber (preferred) or by id
  const user = state.users.find(u => (u.adminNumber && String(u.adminNumber) === String(lookupKey)) || u.id === lookupKey);

  // error / guard checks
  if(!user){
    return <div className="card"><p>Admin not found. If you just signed up, reload the page.</p></div>;
  }
  if(!currentUserId){
    return <div className="card"><p>Access denied — please log in.</p></div>;
  }
  if(currentUserId !== user.id){
    return <div className="card"><p>Access denied — you are not signed in as this admin.</p></div>;
  }
  if(!user.isAdmin){
    return <div className="card"><p>Access denied — you are not an administrator.</p></div>;
  }

  const studentCount = state.users.filter(u => !u.isAdmin).length;
  const courseCount = state.courses.length;
  const messageCount = state.messages ? state.messages.length : 0;

  const [form, setForm] = useState({ code:'', name:'', term:'', startDate:'', endDate:'', description:'' });
  const [editingId, setEditingId] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if(!form.code || !form.name){
      alert('Please enter code and name');
      return;
    }
    if(editingId){
      editCourse({ ...form, id: editingId });
      setEditingId(null);
    } else {
      const idc = generateCourseId('C');
      addCourse({ ...form, id: idc, code: form.code });
    }
    setForm({ code:'', name:'', term:'', startDate:'', endDate:'', description:'' });
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ code:c.code, name:c.name, term:c.term, startDate:c.startDate, endDate:c.endDate, description:c.description });
  };

  const routeId = user.adminNumber || user.id;

  return (
    <div>
      <section className="card topbar">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="small">Welcome, {user.firstName} {user.lastName}</p>
          <p className="small">Role: {user.isAdmin ? 'Administrator' : 'Student'}</p>
        </div>
        <div>
          <button onClick={() => navigate(`/admin/${routeId}/profile`)}>View Profile</button>
        </div>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Overview</h3>
        <ul>
          <li>First name: {user.firstName}</li>
          <li>Username / ID: {user.id}</li>
          <li>Admin number: {user.adminNumber || '—'}</li>
          <li>Role: {user.isAdmin ? 'Admin' : 'Student'}</li>
          <li>Total students: {studentCount}</li>
          <li>Total courses: {courseCount}</li>
          <li>Submitted messages: {messageCount}</li>
        </ul>

        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button onClick={() => navigate('/admin/' + routeId + '/courses')}>Manage Courses</button>
          <button onClick={() => navigate('/admin/' + routeId + '/students')}>View Registered Students</button>
          <button onClick={() => navigate('/admin/' + routeId + '/messages')}>View Messages</button>
        </div>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Create / Edit Course</h3>
        <form onSubmit={submit}>
          <input name="code" placeholder="Course code" value={form.code} onChange={e=>setForm({...form, code: e.target.value})} />
          <input name="name" placeholder="Course name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          <input name="term" placeholder="Term" value={form.term} onChange={e=>setForm({...form, term: e.target.value})} />
          <input name="startDate" placeholder="Start date" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} />
          <input name="endDate" placeholder="End date" value={form.endDate} onChange={e=>setForm({...form, endDate: e.target.value})} />
          <input name="description" placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
          <button type="submit">{editingId ? 'Save' : 'Create'}</button>
          {editingId && <button type="button" onClick={()=> { setEditingId(null); setForm({ code:'', name:'', term:'', startDate:'', endDate:'', description:'' }) }}>Cancel</button>}
        </form>
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Existing Courses</h3>
        {state.courses.length === 0 ? <p>No courses.</p> : (
          <ul>
            {state.courses.map(c=> (
              <li key={c.id}>
                <strong>{c.code}</strong> - {c.name} ({c.term})
                <div className="actions">
                  <button onClick={()=> startEdit(c)}>Edit</button>
                  <button onClick={()=> deleteCourse(c.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Registered Students</h3>
        {state.users.length === 0 ? <p>No students yet.</p> : (
          <ul>
            {state.users.map(u=> (
              <li key={u.id}>{u.firstName} {u.lastName} ({u.id}) - {u.registeredCourses ? u.registeredCourses.length : 0} courses</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" style={{marginTop:12}}>
        <h3>Messages from students</h3>
        {state.messages.length === 0 ? <p>No messages yet.</p> : (
          <ul>
            {state.messages.map(m=> (
              <li key={m.id}><strong>{m.subject}</strong> from {m.from} on {m.date}<p>{m.message}</p></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
