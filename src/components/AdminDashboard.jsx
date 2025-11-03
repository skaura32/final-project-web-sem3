import React, { useState, useEffect } from 'react';
import '../App.css';

function loadUsers() {
  try {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function loadCourses() {
  try {
    const raw = localStorage.getItem('courses');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCourses(courses) {
  localStorage.setItem('courses', JSON.stringify(courses));
}

function loadMessages() {
  try {
    const raw = localStorage.getItem('messages');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AdminDashboard() {
  const admin = JSON.parse(localStorage.getItem('currentUser'));
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '' });
  const [status, setStatus] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setUsers(loadUsers());
    const rawCourses = loadCourses();
    const normalized = (rawCourses || []).map(c => {
      const courseCode = c.courseCode || c.code || '';
      const fees = c.fees || ( (c.domesticFee || c.internationalFee) ? {
        domestic: c.domesticFee ? Number(c.domesticFee) : undefined,
        international: c.internationalFee ? Number(c.internationalFee) : undefined
      } : undefined );
      return { ...c, courseCode, fees };
    });
    setCourses(normalized);
    setMessages(loadMessages());
  }, []);

  const filteredCourses = courses.filter(c => {
    const code = (c.courseCode || c.code || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    const q = (search || '').toLowerCase();
    return code.includes(q) || name.includes(q);
  });

  const studentsByProgram = users.filter(u => !u.isAdmin).reduce((acc, u) => {
    acc[u.program] = acc[u.program] || [];
    acc[u.program].push(u);
    return acc;
  }, {});

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOrEditCourse = (e) => {
    e.preventDefault();
    if (!courseForm.courseCode || !courseForm.name || !courseForm.term) {
      setStatus('Please fill all required fields.');
      return;
    }
    const fees = {
      domestic: courseForm.domesticFee ? Number(courseForm.domesticFee) : undefined,
      international: courseForm.internationalFee ? Number(courseForm.internationalFee) : undefined
    };

    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map(c =>
        c.courseCode === editingCourse.courseCode ? { ...courseForm, fees } : c
      );
      setStatus('Course updated.');
    } else {
      if (courses.find(c => c.courseCode === courseForm.courseCode)) {
        setStatus('Course code already exists.');
        return;
      }
      updatedCourses = [...courses, { ...courseForm, fees }];
      setStatus('Course created.');
    }
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setEditingCourse(null);
    setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '' });
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      courseCode: course.courseCode || '',
      name: course.name || '',
      term: course.term || '',
      startDate: course.startDate || '',
      endDate: course.endDate || '',
      domesticFee: course.fees && course.fees.domestic ? String(course.fees.domestic) : '',
      internationalFee: course.fees && course.fees.international ? String(course.fees.international) : ''
    });
    setStatus('');
  };

  const handleDeleteCourse = (courseCode) => {
    if (!window.confirm('Delete this course?')) return;
    const updatedCourses = courses.filter(c => c.courseCode !== courseCode);
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setStatus('Course deleted.');
    setEditingCourse(null);
    setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '' });
  };

  if (!admin || !admin.isAdmin) {
    return (
      <div className="signup-container">
        <h2>Admin Only</h2>
        <p>You must be logged in as an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Welcome, {admin.firstName} ({admin.isAdmin ? 'Admin' : 'Student'})</strong>
        <button className="view-profile-btn" style={{ marginLeft: 16 }} onClick={() => setShowProfile(s => !s)}>
          {showProfile ? 'Hide Profile' : 'View Profile'}
        </button>
      </div>
      {showProfile && (
        <div className="student-info" style={{ marginBottom: 16 }}>
          <h3>Admin Profile</h3>
          <div className="info-grid">
            <div className="info-item"><label>Name:</label><span>{admin.firstName} {admin.lastName}</span></div>
            <div className="info-item"><label>Email:</label><span>{admin.email}</span></div>
            <div className="info-item"><label>Username:</label><span>{admin.username}</span></div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h3>Manage Courses</h3>
        <form onSubmit={handleCreateOrEditCourse} style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label htmlFor="courseCode">Course Code</label>
            <input id="courseCode" name="courseCode" placeholder="Course Code" value={courseForm.courseCode} onChange={handleCourseFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="name">Course Name</label>
            <input id="name" name="name" placeholder="Course Name" value={courseForm.name} onChange={handleCourseFormChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="term">Term</label>
            <select id="term" name="term" value={courseForm.term} onChange={handleCourseFormChange} required>
              <option value="">Select Term</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input id="startDate" name="startDate" type="date" value={courseForm.startDate} onChange={handleCourseFormChange} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input id="endDate" name="endDate" type="date" value={courseForm.endDate} onChange={handleCourseFormChange} />
          </div>

          <div className="form-group">
            <label htmlFor="domesticFee">Domestic Fee (CAD)</label>
            <input id="domesticFee" name="domesticFee" type="number" min="0" placeholder="e.g. 9254" value={courseForm.domesticFee} onChange={handleCourseFormChange} />
          </div>
          <div className="form-group">
            <label htmlFor="internationalFee">International Fee (CAD)</label>
            <input id="internationalFee" name="internationalFee" type="number" min="0" placeholder="e.g. 27735" value={courseForm.internationalFee} onChange={handleCourseFormChange} />
          </div>

          <button type="submit">{editingCourse ? 'Update Course' : 'Create Course'}</button>
          {editingCourse && (
            <button type="button" style={{ marginLeft: 8 }} onClick={() => { setEditingCourse(null); setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '' }); }}>Cancel</button>
          )}
        </form>
        {status && <div className="message success">{status}</div>}
        <div className="search-row">
          <input className="search-input" placeholder="Search courses by code or name" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <ul className="course-list">
          {filteredCourses.map(c => (
            <li key={c.courseCode || c.code} className="course-item">
              <div>
                <strong>{c.courseCode || c.code}</strong> — {c.name} <em>({c.term})</em>
                {c.startDate && <> | Start: {c.startDate}</>}
                {c.endDate && <> | End: {c.endDate}</>}
                {c.fees && (
                  <div style={{ marginTop: 6, color: '#374151' }}>
                    Fees: {c.fees.domestic ? '$' + c.fees.domestic.toLocaleString() + ' (domestic)' : '—'}
                    {c.fees.international ? ' / $' + c.fees.international.toLocaleString() + ' (international)' : ''}
                  </div>
                )}
              </div>
              <div>
                <button className="btn" onClick={() => handleEditCourse(c)}>Edit</button>
                <button className="btn remove-btn" onClick={() => handleDeleteCourse(c.courseCode)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3>Registered Students by Program</h3>
        {Object.keys(studentsByProgram).length === 0 && <p>No students registered.</p>}
        {Object.entries(studentsByProgram).map(([program, students]) => (
          <div key={program} style={{ marginBottom: 10 }}>
            <strong>{program}</strong>
            <ul style={{ marginLeft: 16 }}>
              {students.map(s => (
                <li key={s.studentId}>{s.firstName} {s.lastName} ({s.email})</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <h3>Submitted Contact Forms</h3>
        {messages.length === 0 && <p>No messages submitted.</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map(m => (
            <li key={m.id} className="course-item" style={{ marginBottom: 10 }}>
              <div>
                <strong>{m.subject}</strong> from {m.name} ({m.email})<br />
                <span style={{ color: '#374151' }}>{m.message}</span>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(m.date).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}