import React, { useState, useEffect } from 'react';
import { generateStudentId } from '../data';

export default function Signup({ programs, onRegister, navigate }){
  const initial = { firstName:'', lastName:'', email:'', phone:'', birthDate:'', department:'SD', program:'SD_DIP', username:'', password:'', isAdmin:false, isStudent:true };
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [infoCorrect, setInfoCorrect] = useState(false);

  // clear any previous inputs on mount
  useEffect(()=>{ setForm(initial); setFile(null); setInfoCorrect(false); }, []);

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;
    if(type === 'file'){
      setFile(files[0] || null);
      return;
    }

    // For admin/student checkboxes: only one allowed
    if(name === 'isAdmin'){
      setForm(prev=> ({ ...prev, isAdmin: checked, isStudent: !checked }));
      return;
    }
    if(name === 'isStudent'){
      setForm(prev=> ({ ...prev, isStudent: checked, isAdmin: !checked }));
      return;
    }

    setForm(prev=> ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const nameValid = (n) => /^[A-Za-z\s]+$/.test(n);
  const emailValid = (em) => /.+@.+\.(com|co\.in|ca)$/i.test(em);
  const phoneValid = (ph) => /^[0-9+\-\s().]{7,20}$/.test(ph);
  const validate = () => {
    // required
    if(!form.firstName || !form.lastName || !form.username || !form.password || !form.email) return 'Please fill required fields';
    // name checks
    if(!nameValid(form.firstName) || !nameValid(form.lastName)) return 'First and last name must contain only letters and spaces';
    // email allowed domains
    if(!emailValid(form.email)) return 'Email must end with .com, .co.in or .ca';
    // birth-date yyyy-mm-dd and not today or future
    if(form.birthDate && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(form.birthDate)) return 'Birth Date must be in yyyy-mm-dd format';
    if(form.birthDate){
      const selected = new Date(form.birthDate);
      const today = new Date();
      // zero time for comparison
      selected.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      if(selected >= today) return 'Birth Date cannot be today or a future date';
    }
    // phone: relaxed validation (digits, spaces, +, parentheses, dots, dashes)
    if(form.phone && !phoneValid(form.phone)) return 'Phone contains invalid characters or is too short';
    // username must contain at least one alphabet from first and last name
    const uname = form.username.toLowerCase();
    const fn = form.firstName.toLowerCase();
    const ln = form.lastName.toLowerCase();
    const hasFromFirst = fn.split('').some(ch => /[a-z]/.test(ch) && uname.includes(ch));
    const hasFromLast = ln.split('').some(ch => /[a-z]/.test(ch) && uname.includes(ch));
    if(!hasFromFirst || !hasFromLast) return 'Username must include at least one alphabet from both first and last name';
    // password checks: not same as username and contains number or special char
    if(form.password === form.username) return 'Password must not be the same as username';
    if(!/[0-9\W]/.test(form.password)) return 'Password must contain a number or special character';
    // must choose role
    if(!form.isAdmin && !form.isStudent) return 'Please choose to register as Admin or Student';
    // confirmation checkbox
    if(!infoCorrect) return 'Please confirm that the information provided is correct';
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if(err){ alert(err); return; }

    const id = generateStudentId();

    const createAndNavigate = (profilePicDataUrl) =>{
      const newUser = { ...form, id, registeredCourses: [], profilePic: profilePicDataUrl };
      onRegister(newUser);
      alert('Registered with ID: ' + id);
      // navigate to student or admin dashboard after signup
      if(newUser.isAdmin){ navigate('/admin/' + id); } 
      else { navigate('/student/' + id); }
    };

    if(file){
      const reader = new FileReader();
      reader.onload = function(ev){
        createAndNavigate(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      createAndNavigate(null);
    }
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
          <input name="birthDate" type="date" aria-label="Birth Date" value={form.birthDate} onChange={handle} />
        </div>
        <select name="program" value={form.program} onChange={handle}>
          {programs.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{display:'flex', gap:8}}>
          <input name="username" placeholder="Username" value={form.username} onChange={handle} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />
        </div>

        <div style={{display:'flex', gap:12, marginTop:8}}>
          <label style={{display:'flex', alignItems:'center', gap:6}}>
            <input id="isStudent" name="isStudent" type="checkbox" checked={form.isStudent} onChange={handle} />
            <span>Register as Student</span>
          </label>
          <label style={{display:'flex', alignItems:'center', gap:6}}>
            <input id="isAdmin" name="isAdmin" type="checkbox" checked={form.isAdmin} onChange={handle} />
            <span>Register as Admin</span>
          </label>
        </div>

        <div style={{marginTop:8, display:'flex', gap:12, alignItems:'center'}}>
          <div style={{width:140, height:140, border:'1px dashed #ccc', borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:8}}>
            {file ? (
              <img src={URL.createObjectURL(file)} alt="preview" style={{maxWidth:'100%', maxHeight:'100%', borderRadius:6}} />
            ) : (
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:24}}>📷</div>
                <div style={{fontSize:12, color:'#666'}}>Upload picture</div>
              </div>
            )}
          </div>
          <div>
            <label style={{display:'block', marginBottom:6}}>Profile picture (optional)</label>
            <input type="file" accept="image/*" onChange={handle} />
          </div>
        </div>

        <div style={{marginTop:8, textAlign:'center'}}>
          <label style={{display:'inline-flex', alignItems:'center', gap:8, justifyContent:'center'}}>
            <input type="checkbox" checked={infoCorrect} onChange={e=>setInfoCorrect(e.target.checked)} />
            <span style={{display:'inline-block', marginLeft:2}}>All the information provided above is correct</span>
          </label>
        </div>

        <div style={{marginTop:12, textAlign:'center'}}>
          <button type="submit" disabled={!infoCorrect}>Sign Up</button>
        </div>
      </form>
    </div>
  );
}
