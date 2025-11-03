export const SAMPLE_COURSES = [
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