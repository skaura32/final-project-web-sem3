import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const SAMPLE_COURSES = [
  { courseCode: 'SD101', name: 'Intro to Software Development', term: 'Spring' },
  { courseCode: 'SD102', name: 'Web Programming I', term: 'Spring' },
  { courseCode: 'SD201', name: 'Databases', term: 'Fall' },
  { courseCode: 'SD202', name: 'Web Programming II', term: 'Fall' },
  { courseCode: 'SD301', name: 'Mobile Development', term: 'Summer' },
  { courseCode: 'SD302', name: 'Cloud Fundamentals', term: 'Winter' },
  { courseCode: 'SD303', name: 'APIs & Microservices', term: 'Summer' },
  { courseCode: 'SD401', name: 'Capstone Project', term: 'Fall' }
];

const TERMS = ['Spring', 'Summer', 'Fall', 'Winter'];

const regsKey = (studentId) => `registrations_${studentId}`;

function loadRegistrations(studentId) {
  try {
    const raw = localStorage.getItem(regsKey(studentId));
    
    const parsed = raw ? JSON.parse(raw) : {};
    const mapped = {};
    Object.keys(parsed).forEach(term => {
      mapped[term] = (parsed[term] || []).map(code =>
        SAMPLE_COURSES.find(c => c.courseCode === code) || { courseCode: code, name: code }
      );
    });
    return mapped;
  } catch {
    return {};
  }
}

function saveRegistrations(studentId, data) {
  // Data is term -> array of course objects. Save as term -> array of courseCode strings.
  const toSave = {};
  Object.keys(data).forEach(term => {
    toSave[term] = (data[term] || []).map(item => (typeof item === 'string' ? item : item.courseCode));
  });
  localStorage.setItem(regsKey(studentId), JSON.stringify(toSave));
}

export default function Courses() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const isLogged = Boolean(user);
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [available, setAvailable] = useState(SAMPLE_COURSES);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If no term selected, clear selected
    if (!term) {
      setSelected([]);
      setMessage('');
      return;
    }

    if (!isLogged) {
      // non-users see no previously saved registrations
      setSelected([]);
      setMessage('');
      return;
    }

    const regs = loadRegistrations(user.studentId);
    setSelected(regs[term] || []);
    setMessage('');
  }, [term, isLogged, user]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    setAvailable(
      q
        ? SAMPLE_COURSES.filter(
            c =>
              c.courseCode.toLowerCase().includes(q) ||
              c.name.toLowerCase().includes(q)
          )
        : SAMPLE_COURSES
    );
  }, [query]);

  const addCourse = (course) => {
    setMessage('');
    if (!term) {
      setMessage('Select a term before adding courses.');
      return;
    }
    if (!isLogged) {
      setMessage('Please login to register for courses.');
      return;
    }
    // Prevent duplicates for same term
    if (selected.some(c => c.courseCode === course.courseCode)) {
      setMessage('Course already selected for this term.');
      return;
    }
    // Enforce max 5
    if (selected.length >= 5) {
      setMessage('Maximum 5 courses allowed per term.');
      return;
    }
    setSelected(prev => [...prev, course]);
  };

  const removeCourse = (courseCode) => {
    if (!isLogged) {
      setMessage('Please login to modify registrations.');
      return;
    }
    setSelected(prev => prev.filter(c => c.courseCode !== courseCode));
    setMessage('');
  };

  const submitRegistration = () => {
    if (!term) {
      setMessage('Please select a term.');
      return;
    }
    if (!isLogged) {
      setMessage('Please login to submit registration.');
      return;
    }
    if (selected.length < 2) {
      setMessage('You must register for at least 2 courses.');
      return;
    }
    const regs = loadRegistrations(user.studentId);
    regs[term] = selected;
    saveRegistrations(user.studentId, regs);
    setMessage('Registration saved successfully.');
  };

  return (
    <div className="signup-container courses-page">
      <h2>Course Registration</h2>

      {!isLogged && (
        <p className="muted">Viewing as guest. Login to add/remove/submit registrations.</p>
      )}

      <div style={{ marginBottom: 12 }} className="term-row">
        <label style={{ marginRight: 8 }}>Select Term:</label>
        <select
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setMessage('');
          }}
          className="term-select"
        >
          <option value="">-- Choose Term --</option>
          {TERMS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }} className="search-row">
        <input
          type="text"
          placeholder="Search by course code or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="courses-flex" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div className="available-column">
          <h4>Available Courses</h4>
          <ul className="course-list">
            {available
              .filter(c => !selected.find(s => s.courseCode === c.courseCode))
              .map(c => (
                <li key={c.courseCode} className="course-item">
                  <div className="course-meta">
                    <div className="course-code">{c.courseCode}</div>
                    <div className="course-name">{c.name}</div>
                    <div className="course-term">{c.term}</div>
                  </div>
                  <div>
                    <button
                      className="btn add-btn"
                      onClick={() => addCourse(c)}
                      disabled={!isLogged || (term && term !== c.term)}
                      title={!isLogged ? 'Login to add' : (term && term !== c.term ? 'Select matching term to add' : '')}
                    >
                      Add
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        <div className="selected-column">
          <h4>Selected Courses ({term || 'no term'})</h4>
          {selected.length === 0 && <p>No courses selected.</p>}
          <ul className="course-list">
            {selected.map(c => (
              <li key={c.courseCode} className="course-item">
                <div className="course-meta">
                  <div className="course-code">{c.courseCode}</div>
                  <div className="course-name">{c.name}</div>
                </div>
                <div>
                  <button
                    className="btn remove-btn"
                    onClick={() => removeCourse(c.courseCode)}
                    disabled={!isLogged}
                    title={!isLogged ? 'Login to remove' : ''}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 12 }}>
            <button className="primary" onClick={submitRegistration} disabled={!isLogged}>
              Submit Registration
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ...existing code...