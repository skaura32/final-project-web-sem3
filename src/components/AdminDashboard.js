import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateCourseId } from '../data';

export default function AdminDashboard({ state, addCourse, editCourse, deleteCourse }){
  const { id } = useParams();
  const user = state.users.find(u=> u.id === id);
  const [form, setForm] = useState({ code:'', name:'', term:'', startDate:'', endDate:'', description:'' });
  const [editingId, setEditingId] = useState(null);

  if(!user){
    return <div className="card"><p>Admin user not found.</p></div>;
  }

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

  return (
    <div>
      <section className="card topbar">
        <div>
          <h2>Admin Panel - {user.firstName} {user.lastName}</h2>
          <p className="small">ID: {user.id}</p>
        </div>
        <div>
          <button onClick={()=> window.location.href = '/'}>Home</button>
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
