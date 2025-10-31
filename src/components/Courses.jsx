import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const SAMPLE_COURSES = [
  { courseCode: 'SD101', name: 'Intro to Software Development', term: 'Spring',
    program: 'Software Development - Diploma',
    fees: { domestic: 9254, international: 27735 },
    startDate: '2024-03-01', endDate: '2024-06-30',
    description: 'Fundamentals of programming, problem solving and software lifecycle.' },
  { courseCode: 'SD102', name: 'Web Programming I', term: 'Spring',
    program: 'Software Development - Diploma',
    fees: { domestic: 9254, international: 27735 },
    startDate: '2024-03-01', endDate: '2024-06-30',
    description: 'HTML, CSS, basic JavaScript and DOM.' },
  { courseCode: 'SD201', name: 'Databases', term: 'Fall',
    program: 'Software Development - Diploma',
    fees: { domestic: 9254, international: 27735 },
    startDate: '2024-09-05', endDate: '2024-12-20',
    description: 'Relational databases, SQL, normalization.' },
  { courseCode: 'SD202', name: 'Web Programming II', term: 'Fall',
    program: 'Software Development - Diploma',
    fees: { domestic: 9254, international: 27735 },
    startDate: '2024-09-05', endDate: '2024-12-20',
    description: 'Advanced JS, frameworks and REST APIs.' },
  { courseCode: 'SD301', name: 'Mobile Development', term: 'Summer',
    program: 'Software Development - Post-Diploma',
    fees: { domestic: 7895, international: 23675 },
    startDate: '2024-06-01', endDate: '2024-08-31',
    description: 'Mobile app basics for Android/iOS.' },
  { courseCode: 'SD302', name: 'Cloud Fundamentals', term: 'Winter',
    program: 'Software Development - Certificate',
    fees: { domestic: 3000, international: 7000 },
    startDate: '2025-01-05', endDate: '2025-03-31',
    description: 'Intro to cloud services and deployment.' },
  { courseCode: 'SD303', name: 'APIs & Microservices', term: 'Summer',
    program: 'Software Development - Post-Diploma',
    fees: { domestic: 7895, international: 23675 },
    startDate: '2024-06-01', endDate: '2024-08-31',
    description: 'Designing and building REST APIs and microservices.' },
  { courseCode: 'SD401', name: 'Capstone Project', term: 'Fall',
    program: 'Software Development - Diploma',
    fees: { domestic: 9254, international: 27735 },
    startDate: '2024-09-05', endDate: '2024-12-20',
    description: 'Project-based capstone integrating learned skills.' }
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
  const [user] = useState(() => JSON.parse(localStorage.getItem('currentUser'))); // Move to useState initializer
  const isLogged = Boolean(user);
  const [term, setTerm] = useState('');
  const [query, setQuery] = useState('');
  const [available, setAvailable] = useState(SAMPLE_COURSES);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [detailsCourse, setDetailsCourse] = useState(null);

  // First useEffect - handle term changes and load registrations
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

    // Load saved registrations only when term changes
    const regs = loadRegistrations(user.studentId);
    setSelected(regs[term] || []);
    setMessage('');
  }, [term, isLogged, user?.studentId]); // Changed dependency to user.studentId

  // Second useEffect - handle search query and term filter
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const filteredByQuery = q
      ? SAMPLE_COURSES.filter(
          c =>
            c.courseCode.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q)
        )
      : SAMPLE_COURSES;

    // If a term is selected, show only courses for that term
    const filtered = term ? filteredByQuery.filter(c => c.term === term) : filteredByQuery;

    setAvailable(filtered);
  }, [query, term]); // depend on query and term

  // Add these memoized handlers to prevent unnecessary re-renders
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
    regs[term] = selected;
    saveRegistrations(user.studentId, regs);
    setMessage('Registration saved successfully.');
  }, [term, isLogged, selected, user?.studentId]);

  // open details modal
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

      {/* Details modal */}
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