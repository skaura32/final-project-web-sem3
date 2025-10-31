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
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    name: '',
    term: '',
    startDate: '',
    endDate: '',
    domesticFee: '',
    internationalFee: '',
    description: ''
  });
  const [status, setStatus] = useState('');

  // Load & normalize courses once
  useEffect(() => {
    const raw = loadCourses();
    const normalized = (raw || []).map(c => {
      const courseCode = c.courseCode || c.code || '';
      const feesFromTop = c.fees || {};
      // support legacy domesticFee/internationalFee keys
      const fees = {
        domestic: feesFromTop.domestic ?? (c.domesticFee ? Number(c.domesticFee) : undefined),
        international: feesFromTop.international ?? (c.internationalFee ? Number(c.internationalFee) : undefined)
      };
      return {
        ...c,
        courseCode,
        name: c.name || c.courseName || '',
        term: c.term || c.semester || '',
        startDate: c.startDate || '',
        endDate: c.endDate || '',
        description: c.description || '',
        fees: (fees.domestic || fees.international) ? fees : undefined
      };
    });
    setCourses(normalized);
  }, []);

  const filteredCourses = courses.filter(c => {
    const q = (search || '').toLowerCase();
    const code = (c.courseCode || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    return code.includes(q) || name.includes(q);
  });

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
        (c.courseCode === editingCourse.courseCode)
          ? {
              ...c,
              courseCode: courseForm.courseCode,
              name: courseForm.name,
              term: courseForm.term,
              startDate: courseForm.startDate,
              endDate: courseForm.endDate,
              description: courseForm.description,
              fees: (fees.domestic || fees.international) ? fees : undefined
            }
          : c
      );
      setStatus('Course updated.');
    } else {
      if (courses.find(c => c.courseCode === courseForm.courseCode)) {
        setStatus('Course code already exists.');
        return;
      }
      const newCourse = {
        courseCode: courseForm.courseCode,
        name: courseForm.name,
        term: courseForm.term,
        startDate: courseForm.startDate,
        endDate: courseForm.endDate,
        description: courseForm.description,
        fees: (fees.domestic || fees.international) ? fees : undefined
      };
      updatedCourses = [...courses, newCourse];
      setStatus('Course created.');
    }
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setEditingCourse(null);
    setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '', description: '' });
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
      internationalFee: course.fees && course.fees.international ? String(course.fees.international) : '',
      description: course.description || ''
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
    setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '', description: '' });
  };

  if (!admin || !admin.isAdmin) {
    return <div className="signup-container"><h2>Admin Only</h2></div>;
  }

  return (
    <div className="signup-container">
      <h2>Manage Courses</h2>
      <form onSubmit={handleCreateOrEditCourse} style={{ marginBottom: 12 }}>
        <div className="form-group">
          <label>Course Code</label>
          <input name="courseCode" placeholder="Course Code" value={courseForm.courseCode} onChange={handleCourseFormChange} required />
        </div>
        <div className="form-group">
          <label>Course Name</label>
          <input name="name" placeholder="Course Name" value={courseForm.name} onChange={handleCourseFormChange} required />
        </div>
        <div className="form-group">
          <label>Term</label>
          <select name="term" value={courseForm.term} onChange={handleCourseFormChange} required>
            <option value="">Select Term</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
        <div className="form-row" style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Start Date</label>
            <input name="startDate" type="date" value={courseForm.startDate} onChange={handleCourseFormChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label>End Date</label>
            <input name="endDate" type="date" value={courseForm.endDate} onChange={handleCourseFormChange} />
          </div>
        </div>

        <div style={{ height: 8 }} />

        <div className="form-row" style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Domestic Fee (CAD)</label>
            <input name="domesticFee" type="number" min="0" placeholder="e.g. 9254" value={courseForm.domesticFee} onChange={handleCourseFormChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label>International Fee (CAD)</label>
            <input name="internationalFee" type="number" min="0" placeholder="e.g. 27735" value={courseForm.internationalFee} onChange={handleCourseFormChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <textarea name="description" placeholder="Short description" value={courseForm.description} onChange={handleCourseFormChange} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit">{editingCourse ? 'Update Course' : 'Create Course'}</button>
          {editingCourse && (
            <button type="button" style={{ marginLeft: 8 }} onClick={() => { setEditingCourse(null); setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '', description: '' }); }}>Cancel</button>
          )}
        </div>
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
              {c.fees && (
                <div style={{ marginTop: 6, color: '#374151' }}>
                  Fees: {c.fees.domestic ? '$' + c.fees.domestic.toLocaleString() + ' (domestic)' : '—'}
                  {c.fees.international ? ' / $' + c.fees.international.toLocaleString() + ' (international)' : ''}
                </div>
              )}
              {c.description && <div style={{ marginTop: 6, color: '#6b7280' }}>{c.description}</div>}
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