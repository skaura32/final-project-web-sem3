import React, { useState } from 'react';
import { generateStudentId } from '../data';

export default function Signup({ programs, onRegister, navigate }){
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'', birthday:'', department:'SD', program:'SD_DIP', username:'', password:'', isAdmin:false
  });

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev=> ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    // basic validation
    if(!form.firstName || !form.lastName || !form.username || !form.password || !form.email){
      alert('Please fill required fields');
      return;
    }
    const id = generateStudentId();
    const newUser = { ...form, id, registeredCourses: [] };
    onRegister(newUser);
    alert('Registered with ID: ' + id);
    // navigate to student dashboard after signup
    navigate('/student/' + id);
  };

  return (
    <div className="card" style={{maxWidth:700}}>
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <div style={{display:'flex', gap:8}}>
          <input name="firstName" placeholder="First name" value={form.firstName} onChange={handle} required />
          <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handle} required />
        </div>
        <input name="email" placeholder="Email" value={form.email} onChange={handle} required />
        <div style={{display:'flex', gap:8}}>
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handle} />
          <input name="birthday" placeholder="Birthday (YYYY-MM-DD)" value={form.birthday} onChange={handle} />
        </div>
        <select name="program" value={form.program} onChange={handle}>
          {programs.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{display:'flex', gap:8}}>
          <input name="username" placeholder="Username" value={form.username} onChange={handle} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />
        </div>
        <label><input name="isAdmin" type="checkbox" checked={form.isAdmin} onChange={handle} /> Register as Admin (for demo)</label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
