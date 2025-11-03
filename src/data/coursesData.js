export const SAMPLE_COURSES = [
  { courseCode: 'MGMT201', name: 'Essential Skills for Teams Collaboration', term: 'Spring',
    program: 'Software Development - Diploma',
    fees: { domestic: 854, international: 2035 },
    startDate: '2024-03-01', endDate: '2024-06-30',
    description: 'practical skills in effective communication and teamwork.' },
  { courseCode: 'SD102', name: 'Web Programming I', term: 'Spring',
    program: 'Software Development - Diploma',
    fees: { domestic: 850, international: 2000 },
    startDate: '2024-03-01', endDate: '2024-06-30',
    description: 'HTML, CSS, basic JavaScript and DOM.' },
  { courseCode: 'SD201', name: 'Introduction to Relational Databases', term: 'Fall',
    program: 'Software Development - Diploma',
    fees: { domestic: 854, international: 2735 },
    startDate: '2024-09-05', endDate: '2024-12-20',
    description: 'Relational databases, SQL, normalization.' },
  { courseCode: 'SD202', name: 'Web Programming II', term: 'Fall',
    program: 'Software Development - Diploma',
    fees: { domestic: 800, international: 2050 },
    startDate: '2024-09-05', endDate: '2024-12-20',
    description: 'Advanced JS, frameworks and REST APIs.' },
  { courseCode: 'SD301', name: 'Mobile Application Development with React', term: 'Summer',
    program: 'Software Development - Post-Diploma',
    fees: { domestic: 895, international: 2675 },
    startDate: '2024-06-01', endDate: '2024-08-31',
    description: 'Mobile app basics for Android/iOS.' },
  { courseCode: 'SD302', name: 'Object Oriented Programming', term: 'Winter',
    program: 'Software Development - Certificate',
    fees: { domestic: 850, international: 2000 },
    startDate: '2025-01-05', endDate: '2025-03-31',
    description: 'Object Oriented design concepts and techniques' },
];

export function loadAllCourses() {
  try {
    const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]');
    const allCourses = [...SAMPLE_COURSES];

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

export function saveAdminCourses(courses) {
  const customCourses = courses.filter(course => course.isCustom);
  localStorage.setItem('adminCourses', JSON.stringify(customCourses));
}

export function addCourse(newCourse) {
  const allCourses = loadAllCourses();
  const courseWithCustomFlag = {...newCourse, isCustom: true};
  const updatedCourses = [...allCourses, courseWithCustomFlag];
  saveAdminCourses(updatedCourses);
  return updatedCourses;
}

export function updateCourse(courseCode, updatedCourse) {
  const allCourses = loadAllCourses();
  const updatedCourses = allCourses.map(c => 
    c.courseCode === courseCode ? {...updatedCourse, isCustom: true} : c
  );
  saveAdminCourses(updatedCourses);
  return updatedCourses;
}

export function deleteCourse(courseCode) {
  const allCourses = loadAllCourses();
  const course = allCourses.find(c => c.courseCode === courseCode);
  
  if (course && !course.isCustom) {
    throw new Error('Cannot delete system courses');
  }
  
  const updatedCourses = allCourses.filter(c => c.courseCode !== courseCode);
  saveAdminCourses(updatedCourses);
  return updatedCourses;
}