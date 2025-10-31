import React, { useState, useEffect } from 'react';

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

export default function AdminCourses() {
  const admin = JSON.parse(localStorage.getItem('currentUser'));
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ courseCode: '', name: '', term: '', startDate: '', endDate: '' });
  const [status, setStatus] = useState('');

  useEffect(() => { setCourses(loadCourses()); }, []);

  const filteredCourses = courses.filter(
    c =>
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

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
    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map(c =>
        c.courseCode === editingCourse.courseCode ? { ...courseForm } : c
      );
      setStatus('Course updated.');
    } else {
      if (courses.find(c => c.courseCode === courseForm.courseCode)) {
        setStatus('Course code already exists.');
        return;
      }
      updatedCourses = [...courses, { ...courseForm }];
      setStatus('Course created.');
    }
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setEditingCourse(null);
    setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '' });
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm(course);
    setStatus('');
  };

  const handleDeleteCourse = (courseCode) => {
    if (!window.confirm('Delete this course?')) return;
    const updatedCourses = courses.filter(c => c.courseCode !== courseCode);
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setStatus('Course deleted.');
    setEditingCourse(null);
    setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '' });
  };

  if (!admin || !admin.isAdmin) {
    return <div className="signup-container"><h2>Admin Only</h2></div>;
  }

  return (
    <div className="signup-container">
      <h2>Manage Courses</h2>
      <form onSubmit={handleCreateOrEditCourse} style={{ marginBottom: 12 }}>
        <div className="form-group">
          <input name="courseCode" placeholder="Course Code" value={courseForm.courseCode} onChange={handleCourseFormChange} required />
        </div>
        <div className="form-group">
          <input name="name" placeholder="Course Name" value={courseForm.name} onChange={handleCourseFormChange} required />
        </div>
        <div className="form-group">
          <input name="term" placeholder="Term (e.g. Fall)" value={courseForm.term} onChange={handleCourseFormChange} required />
        </div>
        <div className="form-group">
          <input name="startDate" type="date" placeholder="Start Date" value={courseForm.startDate} onChange={handleCourseFormChange} />
        </div>
        <div className="form-group">
          <input name="endDate" type="date" placeholder="End Date" value={courseForm.endDate} onChange={handleCourseFormChange} />
        </div>
        <button type="submit">{editingCourse ? 'Update Course' : 'Create Course'}</button>
        {editingCourse && (
          <button type="button" style={{ marginLeft: 8 }} onClick={() => { setEditingCourse(null); setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '' }); }}>Cancel</button>
        )}
      </form>
      {status && <div className="message success">{status}</div>}
      <div className="search-row">
        <input className="search-input" placeholder="Search courses by code or name" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <ul className="course-list">
        {filteredCourses.map(c => (
          <li key={c.courseCode} className="course-item">
            <div>
              <strong>{c.courseCode}</strong> — {c.name} <em>({c.term})</em>
              {c.startDate && <> | Start: {c.startDate}</>}
              {c.endDate && <> | End: {c.endDate}</>}
            </div>
            <div>
              <button className="btn" onClick={() => handleEditCourse(c)}>Edit</button>
              <button className="btn remove-btn" onClick={() => handleDeleteCourse(c.courseCode)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}