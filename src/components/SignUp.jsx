import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function SignUp({ setUser }) {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    first_name: '',      // ✅ Changed from firstName
    last_name: '',       // ✅ Changed from lastName
    email: '',
    phone: '',
    birthday: '',
    department: 'SD',
    program: '',
    username: '',
    password: '',
    role: 'student',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user types
  };

  const handleRoleChange = (e) => {
    setForm(prev => ({
      ...prev,
      role: e.target.value,
      program: e.target.value === 'admin' ? '' : prev.program
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('=== SIGNUP FORM SUBMIT ===');
    console.log('Form data:', form);

    // Validation
    if (!form.first_name || !form.last_name || !form.email || !form.username || !form.password) {
      setError('Please fill all required fields (First Name, Last Name, Email, Username, Password)');
      return;
    }

    // Admin email validation
    if (form.role === 'admin' && !form.email.endsWith('@bowvalley.ca')) {
      setError('Admin email must end with @bowvalley.ca');
      return;
    }

    // Student program validation (ONLY for students)
    if (form.role === 'student' && !form.program) {
      setError('Please select a program.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password length validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // ✅ Build payload - ONLY include program if student
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || '',
        birthday: form.birthday || '',
        department: form.department,
        username: form.username,
        password: form.password,
      };

      // ✅ Only add program if user is student
      if (form.role === 'student') {
        payload.program = form.program;
      } else {
        // For admin, set a default program or don't include it
        payload.program = 'N/A';  // Backend might still require it
      }

      console.log('📤 Sending to backend:', payload);
      console.log('🌐 URL: http://localhost:5000/api/auth/register');

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', res.status);

      const data = await res.json();
      console.log('📥 Response data:', data);

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      if (data.success) {
        console.log('✅ Registration successful!');
        setSuccess(`✅ Registration successful! Student ID: ${data.student_id}. Redirecting to login...`);
        
        // Store user info if token is provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          if (typeof setUser === 'function') setUser(data.user);
        }

        // Clear form
        setForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          birthday: '',
          department: 'SD',
          program: '',
          username: '',
          password: '',
          role: 'student',
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          if (form.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/login');
          }
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError('Network error. Make sure backend is running on http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Registration</h2>
        
        {/* Error Message */}
        {error && <div className="message error">⚠️ {error}</div>}
        
        {/* Success Message */}
        {success && <div className="message success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* User Role Selection */}
          <div className="form-group">
            <label>
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === 'student'}
                onChange={handleRoleChange}
              /> Student
            </label>
            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={form.role === 'admin'}
                onChange={handleRoleChange}
              /> Admin
            </label>
          </div>

          {/* First Name */}
          <div className="form-group">
            <input 
              name="first_name" 
              placeholder="First Name *" 
              value={form.first_name} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <input 
              name="last_name" 
              placeholder="Last Name *" 
              value={form.last_name} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <input 
              name="email" 
              type="email" 
              placeholder="Email *" 
              value={form.email} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <input 
              name="phone" 
              placeholder="Phone (Optional)" 
              value={form.phone} 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>

          {/* Birthday */}
          <div className="form-group">
            <input 
              name="birthday" 
              type="date" 
              value={form.birthday} 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>

          {/* Department */}
          <div className="form-group">
            <select 
              name="department" 
              value={form.department} 
              onChange={handleChange} 
              disabled={loading}
              required
            >
              <option value="SD">Software Development</option>
              <option value="IT">Information Technology</option>
              <option value="BM">Business Management</option>
            </select>
          </div>

          {/* Program (only for students) */}
          {form.role === 'student' && (
            <div className="form-group">
              <select 
                name="program" 
                value={form.program} 
                onChange={handleChange} 
                disabled={loading}
                required
              >
                <option value="">Select Program *</option>
                <option value="Diploma">Diploma (2 years)</option>
                <option value="Post-Diploma">Post-Diploma (1 year)</option>
                <option value="Certificate">Certificate (6 months)</option>
              </select>
            </div>
          )}

          {/* Username */}
          <div className="form-group">
            <input 
              name="username" 
              placeholder="Username *" 
              value={form.username} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <input 
              name="password" 
              type="password" 
              placeholder="Password * (min 6 characters)" 
              value={form.password} 
              onChange={handleChange} 
              disabled={loading}
              required 
            />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
