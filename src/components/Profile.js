import React, { useState, useEffect } from 'react';

export default function Profile({ state, setState, navigate }){
  const user = state.currentUser;

  const [form, setForm] = useState(user || {});
  const [file, setFile] = useState(null);

  useEffect(()=>{
    setForm(user || {});
  }, [user]);

  if(!user){
    return (
      <div className="card" style={{maxWidth:600}}>
        <h2>My Profile</h2>
        <p>No user is currently logged in. Please <button onClick={()=> navigate('/login')}>Login</button> or <button onClick={()=> navigate('/signup')}>Signup</button>.</p>
      </div>
    );
  }

  const handle = (e) => {
    const { name, value, type, checked, files } = e.target;
    if(type === 'file'){
      setFile(files[0] || null);
      return;
    }
    setForm(prev=> ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = (e) => {
    e.preventDefault();
    // validate fields similar to signup
  const nameValid = (n) => /^[A-Za-z\s]+$/.test(n || '');
  const emailValid = (em) => /.+@.+\.(com|co\.in|ca)$/i.test(em || '');
  const phoneValid = (ph) => /^[0-9+\-\s().]{7,20}$/.test(ph || '');

    if(!form.firstName || !form.lastName || !form.username || !form.email) { alert('Please fill required fields'); return; }
    if(!nameValid(form.firstName) || !nameValid(form.lastName)) { alert('First and last name must contain only letters and spaces'); return; }
    if(!emailValid(form.email)) { alert('Email must end with .com, .co.in or .ca'); return; }
    if(form.birthDate){
      const selected = new Date(form.birthDate);
      const today = new Date(); selected.setHours(0,0,0,0); today.setHours(0,0,0,0);
      if(selected >= today){ alert('Birth Date cannot be today or a future date'); return; }
    }
  // phone: no strict format enforcement (accept default)
  // phone relaxed validation
  if(form.phone && !phoneValid(form.phone)){ alert('Phone contains invalid characters or is too short'); return; }
  if(form.password === form.username){ alert('Password must not be the same as username'); return; }
  if(!/[0-9\W]/.test(form.password)){ alert('Password must contain a number or special character'); return; }

    const finish = (profilePicDataUrl) =>{
      const updated = { ...user, ...form };
      if(profilePicDataUrl) updated.profilePic = profilePicDataUrl;
      setState(prev=>({ ...prev, users: prev.users.map(u => u.id === updated.id ? updated : u), currentUser: updated }));
      alert('Profile updated');
      navigate('/');
    };

    if(file){
      const reader = new FileReader();
      reader.onload = function(ev){ finish(ev.target.result); };
      reader.readAsDataURL(file);
    } else {
      finish();
    }
  };

  const logout = () => {
    setState(prev=>({ ...prev, currentUser: null }));
    navigate('/');
  };

  return (
    <div className="card" style={{maxWidth:700}}>
      <h2>My Profile</h2>

      <div style={{display:'flex', gap:16, alignItems:'flex-start'}}>
        <div style={{width:140, textAlign:'center'}}>
          {form.profilePic ? (
            <img src={form.profilePic} alt="profile" style={{width:120, height:120, borderRadius:8, objectFit:'cover'}} />
          ) : (
            <div style={{width:120, height:120, borderRadius:8, background:'#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>No image</div>
          )}
          <div style={{marginTop:8}}>
            <label style={{display:'block', marginBottom:6}}>Change picture</label>
            <input type="file" accept="image/*" onChange={handle} />
          </div>
        </div>

        <form onSubmit={save} style={{flex:1}}>
          <h3>Saved information</h3>
          <div style={{display:'grid', gridTemplateColumns:'150px 1fr', gap:8, alignItems:'center'}}>
            <div><strong>First name</strong></div><div>{form.firstName}</div>
            <div><strong>Last name</strong></div><div>{form.lastName}</div>
            <div><strong>Email</strong></div><div>{form.email}</div>
            <div><strong>Phone</strong></div><div>{form.phone}</div>
            <div><strong>Birth Date</strong></div><div>{form.birthDate || form.birthday || ''}</div>
            <div><strong>Program</strong></div><div>{form.program}</div>
            <div><strong>Username</strong></div><div>{form.username}</div>
          </div>

          <h4 style={{marginTop:12}}>Edit details</h4>
          <div style={{display:'flex', gap:8}}>
            <input name="firstName" placeholder="First name" value={form.firstName || ''} onChange={handle} required />
            <input name="lastName" placeholder="Last name" value={form.lastName || ''} onChange={handle} required />
          </div>
          <input name="email" placeholder="Email" value={form.email || ''} onChange={handle} required />
          <div style={{display:'flex', gap:8}}>
            <input name="phone" placeholder="Phone" value={form.phone || ''} onChange={handle} />
            <input name="birthDate" type="date" placeholder="Birth Date (YYYY-MM-DD)" value={form.birthDate || ''} onChange={handle} />
          </div>
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <input name="username" placeholder="Username" value={form.username || ''} onChange={handle} required />
            <input name="password" type="password" placeholder="Password" value={form.password || ''} onChange={handle} required />
          </div>

          <div style={{marginTop:8}}>
            <button type="submit">Save</button>
            <button type="button" onClick={logout} style={{marginLeft:8}}>Logout</button>
          </div>
        </form>
      </div>
    </div>
  );
}
