import React, { useState } from 'react';

export default function Login({ onLogin, navigate }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const user = onLogin(username, password);
    if(!user){
      alert('Invalid credentials. If you have not signed up, please sign up first.');
      return;
    }
    if(user.isAdmin){
      navigate('/admin/' + user.id);
    } else {
      navigate('/student/' + user.id);
    }
  };

  return (
    <div className="card" style={{maxWidth:420}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p className="small">Tip: Use Signup to create a student or check 'Register as Admin' to create an admin for demo.</p>
    </div>
  );
}
