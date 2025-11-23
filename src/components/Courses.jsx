import React, { useState, useEffect } from 'react';
import { loadAllCourses } from '../data/coursesData';
import '../App.css';

const TERMS = ['Spring', 'Summer', 'Fall', 'Winter'];

const regsKey = (studentId) => `registrations_${studentId}`;

function loadRegistrations(studentId) {
  try {
    const raw = localStorage.getItem(regsKey(studentId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed;
  } catch {
    return {};
  }
}

function saveRegistrations(studentId, data) {
  localStorage.setItem(regsKey(studentId), JSON.stringify(data));
}

export default function Courses() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const isLogged = Boolean(user);
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [detailsCourse, setDetailsCourse] = useState(null);

  useEffect(() => {
    const courses = loadAllCourses();
    setAllCourses(courses);
  }, []);

  useEffect(() => {
    if (!term) {
      setSelected([]);
      setMessage('');
      return;
    }

    if (!isLogged) {
      setSelected([]);
      setMessage('');
      return;
    }

    const regs = loadRegistrations(user.studentId);
    const termCourses = regs[term] || [];
  
    const selectedCourses = termCourses.map(courseCode => {
      return allCourses.find(c => c.courseCode === courseCode) || { courseCode, name: courseCode };
    });
    
    setSelected(selectedCourses);
    setMessage('');
  }, [term, isLogged, user?.studentId, allCourses]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const filteredByQuery = q
      ? allCourses.filter(
          c =>
            c.courseCode.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q)
        )
      : allCourses;

    const filtered = term ? filteredByQuery.filter(c => c.term === term) : filteredByQuery;
    setAvailable(filtered);
  }, [query, term, allCourses]);

  const addCourse = React.useCallback((course) => {
    setMessage('');
    if (!term) {
      setMessage('Select a term before adding courses.');
      return;
    }
    if (!isLogged) {
      setMessage('Please login to register for courses.');
      return;
    }
   
    if (selected.some(c => c.courseCode === course.courseCode)) {
      setMessage('Course already selected for this term.');
      return;
    }
   
    if (selected.length >= 5) {
      setMessage('Maximum 5 courses allowed per term.');
      return;
    }
    setSelected(prev => [...prev, course]);
  }, [term, isLogged, selected]);

  const removeCourse = React.useCallback((courseCode) => {
    if (!isLogged) {
      setMessage('Please login to modify registrations.');
      return;
    }
    setSelected(prev => prev.filter(c => c.courseCode !== courseCode));
    setMessage('');
  }, [isLogged]);

  const submitRegistration = React.useCallback(() => {
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
    regs[term] = selected.map(c => c.courseCode);
    saveRegistrations(user.studentId, regs);
    setMessage('Registration saved successfully.');
  }, [term, isLogged, selected, user?.studentId]);

  const openDetails = (course) => setDetailsCourse(course);
  const closeDetails = () => setDetailsCourse(null);

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
                    {c.isCustom && <span style={{fontSize: '11px', color: '#666'}}>[Admin Created]</span>}
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button
                      className="btn details-btn"
                      onClick={() => openDetails(c)}
                    >
                      Details
                    </button>
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

      {detailsCourse && (
        <div className="modal-backdrop" onClick={closeDetails} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', justifyContent:'center', alignItems:'center'
        }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{background:'#fff', padding:20, borderRadius:8, maxWidth:600, width:'90%'}}>
            <h3>{detailsCourse.courseCode} - {detailsCourse.name}</h3>
            <p><strong>Program:</strong> {detailsCourse.program || 'N/A'}</p>
            <p><strong>Term:</strong> {detailsCourse.term}</p>
            <p><strong>Dates:</strong> {detailsCourse.startDate ? new Date(detailsCourse.startDate).toLocaleDateString() : 'N/A'} - {detailsCourse.endDate ? new Date(detailsCourse.endDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Fees:</strong> {detailsCourse.fees ? `${detailsCourse.fees.domestic ? '$'+detailsCourse.fees.domestic.toLocaleString()+' (domestic)' : ''}${detailsCourse.fees.international ? (detailsCourse.fees.domestic ? ' / ' : '') + '$' + detailsCourse.fees.international.toLocaleString()+' (international)' : ''}` : 'N/A'}</p>
            <p>{detailsCourse.description}</p>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button className="btn add-btn" onClick={() => { addCourse(detailsCourse); closeDetails(); }} disabled={!isLogged || (term && term !== detailsCourse.term)}>
                Add
              </button>
              <button className="btn" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}