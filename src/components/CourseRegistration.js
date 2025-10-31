import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CourseRegistration({ state, updateUser }) {
  const [selectedTerm, setSelectedTerm] = useState('Summer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const navigate = useNavigate();

  // Update available courses when dependencies change
  useEffect(() => {
    if (!state.courses) return;

    const filtered = state.courses.filter(course => {
      const matchesTerm = course.term === selectedTerm;
      const matchesSearch = !searchQuery || 
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());
      const notSelected = !selectedCourses.some(sc => sc.id === course.id);
      return matchesTerm && matchesSearch && notSelected;
    });

    setAvailableCourses(filtered);
  }, [state.courses, selectedTerm, searchQuery, selectedCourses]);

  const handleAddCourse = (course) => {
    if (!state.currentUser) {
      alert('Please login first');
      navigate('/login');
      return;
    }
    
    if (selectedCourses.some(c => c.id === course.id)) {
      alert('Course already selected');
      return;
    }

    setSelectedCourses(prev => [...prev, course]);
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleSubmitRegistration = () => {
    if (!state.currentUser) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    if (selectedCourses.length === 0) {
      alert('Please select at least one course');
      return;
    }

    const existingCourses = state.currentUser.registeredCourses || [];
    
    const updatedUser = {
      ...state.currentUser,
      registeredCourses: [
        ...existingCourses,
        ...selectedCourses.map(c => ({
          id: c.id,
          code: c.code,
          name: c.name,
          term: c.term
        }))
      ]
    };

    updateUser(updatedUser);
    alert('Registration successful!');
    setSelectedCourses([]);
  };

  return (
    <div className="course-registration">
      <h2>Course Registration</h2>
      <p className="info-text">
        {state.currentUser 
          ? `Logged in as: ${state.currentUser.firstName} ${state.currentUser.lastName}`
          : 'Please login to register for courses'}
      </p>

      <div className="filters">
        <div className="term-select">
          <label>Select Term: </label>
          <select 
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
          </select>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="courses-container">
        <div className="available-courses">
          <h3>Available Courses</h3>
          {availableCourses.length === 0 ? (
            <p>No courses available for selected term.</p>
          ) : (
            <ul>
              {availableCourses.map(course => (
                <li key={course.id} className="course-item">
                  <div className="course-info">
                    <strong>{course.code}</strong>
                    <p>{course.name}</p>
                    <span>{course.term}</span>
                  </div>
                  <button
                    onClick={() => handleAddCourse(course)}
                    disabled={!state.currentUser}
                    className="add-btn"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="selected-courses">
          <h3>Selected Courses ({selectedTerm})</h3>
          {selectedCourses.length === 0 ? (
            <p>No courses selected.</p>
          ) : (
            <ul>
              {selectedCourses.map(course => (
                <li key={course.id} className="course-item">
                  <div className="course-info">
                    <strong>{course.code}</strong>
                    <p>{course.name}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveCourse(course.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          
          <button
            onClick={handleSubmitRegistration}
            disabled={!state.currentUser || selectedCourses.length === 0}
            className="submit-btn"
          >
            Submit Registration
          </button>
        </div>
      </div>
    </div>
  );
}