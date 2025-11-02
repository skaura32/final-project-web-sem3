import React, { useState, useEffect } from 'react';

// Sample courses that students see
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
];

function loadAllCourses() {
  try {
    const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
    const allCourses = [...SAMPLE_COURSES];
    
    // Add admin-created courses
    adminCourses.forEach(adminCourse => {
      if (!allCourses.find(c => c.courseCode === adminCourse.courseCode)) {
        allCourses.push({...adminCourse, isCustom: true});
      }
    });
    
    return allCourses;
  } catch {
    return SAMPLE_COURSES;
  }
}

function saveAdminCourses(courses) {
  // Only save custom courses (not sample courses)
  const customCourses = courses.filter(course => course.isCustom);
  localStorage.setItem('adminCourses', JSON.stringify(customCourses));
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

  useEffect(() => {
    setCourses(loadAllCourses());
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

    const courseData = {
      courseCode: courseForm.courseCode,
      name: courseForm.name,
      term: courseForm.term,
      startDate: courseForm.startDate,
      endDate: courseForm.endDate,
      description: courseForm.description,
      fees: (fees.domestic || fees.international) ? fees : undefined,
      program: 'Software Development - Custom',
      isCustom: true
    };

    try {
      let updatedCourses;
      
      if (editingCourse) {
        if (!editingCourse.isCustom) {
          setStatus('Cannot edit system courses. Create a new course instead.');
          return;
        }
        // Update course
        updatedCourses = courses.map(c => 
          c.courseCode === editingCourse.courseCode ? courseData : c
        );
        setStatus('Course updated successfully.');
      } else {
        if (courses.find(c => c.courseCode === courseForm.courseCode)) {
          setStatus('Course code already exists.');
          return;
        }
        // Add new course
        updatedCourses = [...courses, courseData];
        setStatus('Course created successfully.');
      }
      
      setCourses(updatedCourses);
      saveAdminCourses(updatedCourses);
      setEditingCourse(null);
      setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '', description: '' });
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleEditCourse = (course) => {
    console.log('Editing course:', course); // Debug log
    
    if (!course.isCustom) {
      setStatus('System courses cannot be edited. You can create a new course instead.');
      return;
    }
    
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
    setStatus('Editing course: ' + course.name);
  };

  const handleDeleteCourse = (courseCode) => {
    console.log('Deleting course:', courseCode); // Debug log
    
    const course = courses.find(c => c.courseCode === courseCode);
    if (course && !course.isCustom) {
      setStatus('System courses cannot be deleted.');
      return;
    }
    
    if (!window.confirm('Delete this course?')) return;
    
    try {
      const updatedCourses = courses.filter(c => c.courseCode !== courseCode);
      setCourses(updatedCourses);
      saveAdminCourses(updatedCourses);
      setStatus('Course deleted successfully.');
      
      if (editingCourse && editingCourse.courseCode === courseCode) {
        setEditingCourse(null);
        setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '', description: '' });
      }
    } catch (error) {
      setStatus(error.message);
    }
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
            <button type="button" onClick={() => { 
              setEditingCourse(null); 
              setCourseForm({ courseCode: '', name: '', term: '', startDate: '', endDate: '', domesticFee: '', internationalFee: '', description: '' }); 
            }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {status && <div className="message success" style={{color: status.includes('error') || status.includes('Cannot') || status.includes('already exists') ? 'red' : 'green'}}>{status}</div>}

      <div className="search-row">
        <input className="search-input" placeholder="Search courses by code or name" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ marginTop: 24, marginBottom: 12 }}>
        <h3>All Courses ({filteredCourses.length})</h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          System courses are read-only. You can create new courses or edit/delete your custom courses.
        </p>
      </div>

      <ul className="course-list">
        {filteredCourses.map(c => (
          <li key={c.courseCode} className="course-item">
            <div>
              <strong>{c.courseCode}</strong> — {c.name} <em>({c.term})</em>
              {!c.isCustom && <span style={{ color: '#666', fontSize: '12px' }}> [System Course]</span>}
              {c.description && <p style={{ fontSize: '14px', margin: '4px 0', color: '#666' }}>{c.description}</p>}
              {c.fees && (
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Fees: {c.fees.domestic && `$${c.fees.domestic.toLocaleString()} (domestic)`}
                  {c.fees.domestic && c.fees.international && ' / '}
                  {c.fees.international && `$${c.fees.international.toLocaleString()} (international)`}
                </p>
              )}
            </div>
            <div>
              <button 
                className="btn" 
                onClick={() => handleEditCourse(c)}
                disabled={!c.isCustom}
                title={!c.isCustom ? 'System courses cannot be edited' : 'Edit course'}
              >
                Edit
              </button>
              <button 
                className="btn remove-btn" 
                onClick={() => handleDeleteCourse(c.courseCode)}
                disabled={!c.isCustom}
                title={!c.isCustom ? 'System courses cannot be deleted' : 'Delete course'}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}