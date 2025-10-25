export const programs = [
  {
    id: 'SD_DIP',
    name: 'Software Development - Diploma (2 years)',
    term: 'Winter',
    description: 'A comprehensive two-year software development diploma program designed to equip students...',
    startDate: '2024-09-05',
    endDate: '2026-06-15',
    fees: { domestic: 9254, international: 27735 }
  },
  {
    id: 'SD_POST',
    name: 'Software Development - Post-Diploma (1 year)',
    term: 'Winter',
    description: 'Jumpstart your tech career with our one-year post-diploma program in software development....',
    startDate: '2024-09-05',
    endDate: '2025-06-15',
    fees: { domestic: 7895, international: 23675 }
  },
  {
    id: 'SD_CERT',
    name: 'Software Development - Certificate (6 months)',
    term: 'Winter',
    description: 'Short certificate program covering essential software development topics.',
    startDate: '2025-01-10',
    endDate: '2025-07-10',
    fees: { domestic: 3000, international: 8000 }
  }
];

export const courses = [
  { id: 'SD101', code: 'SD101', name: 'Intro to Programming', term: 'Winter', startDate:'2024-09-10', endDate:'2024-12-15', description:'Basics of programming using JavaScript.' },
  { id: 'SD102', code: 'SD102', name: 'Web Development I', term: 'Winter', startDate:'2024-09-10', endDate:'2024-12-15', description:'HTML, CSS and basic JS for web.' },
  { id: 'SD201', code: 'SD201', name: 'Databases', term: 'Winter', startDate:'2025-01-10', endDate:'2025-04-15', description:'Relational databases and SQL.' },
  { id: 'SD301', code: 'SD301', name: 'Backend Development', term: 'Fall', startDate:'2025-09-05', endDate:'2025-12-15', description:'Node.js fundamentals.' },
  { id: 'SD401', code: 'SD401', name: 'Advanced Web', term: 'Summer', startDate:'2025-06-05', endDate:'2025-08-15', description:'React, state management and testing.' }
];

// messages (contact form) sample
export const sampleMessages = [
  { id: 'M1', from: 'student1@example.com', subject: 'Question about registration', message: 'How many courses can I register for?', date: '2025-02-10' }
];

// Helper to generate student IDs and course IDs
let nextStudentId = 2000;
export function generateStudentId(){
  nextStudentId += 1;
  return 'S' + nextStudentId;
}

export function generateCourseId(prefix='C'){
  return prefix + Date.now();
}
