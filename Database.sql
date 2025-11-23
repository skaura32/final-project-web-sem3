CREATE LOGIN courseadmin WITH PASSWORD = 'Admin@123';

USE CourseRegistrationDB;

CREATE USER courseadmin FOR LOGIN courseadmin;

ALTER ROLE db_owner ADD MEMBER courseadmin;

CREATE DATABASE CourseRegistrationDB;
GO
USE CourseRegistrationDB;
GO

CREATE TABLE Users (
user_id INT PRIMARY KEY IDENTITY(1,1),
student_id VARCHAR(20) UNIQUE NOT NULL,
username VARCHAR(50) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL, 
email VARCHAR(100) UNIQUE NOT NULL,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
phone VARCHAR(20),
birthday DATE,
department VARCHAR(10) DEFAULT 'SD',
program VARCHAR(50),
is_admin BIT DEFAULT 0,
created_at DATETIME DEFAULT GETDATE(),
updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Programs (
program_id VARCHAR(20) PRIMARY KEY,
title VARCHAR(200) NOT NULL,
term VARCHAR(20) NOT NULL,
description TEXT,
start_date DATE NOT NULL,
end_date DATE NOT NULL,
domestic_fee DECIMAL(10,2),
international_fee DECIMAL(10,2),
classification VARCHAR(50),
created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Courses (
course_id INT PRIMARY KEY IDENTITY(1,1),
course_code VARCHAR(20) UNIQUE NOT NULL,
name VARCHAR(200) NOT NULL,
term VARCHAR(20) NOT NULL,
program VARCHAR(100),
description TEXT,
start_date DATE,
end_date DATE,
domestic_fee DECIMAL(10,2),
international_fee DECIMAL(10,2),
is_custom BIT DEFAULT 0,
created_by INT, 
created_at DATETIME DEFAULT GETDATE(),
updated_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (created_by) REFERENCES Users(user_id)
);

CREATE TABLE Enrollments (
enrollment_id INT PRIMARY KEY IDENTITY(1,1),
user_id INT NOT NULL,
course_id INT NOT NULL,
term VARCHAR(20) NOT NULL,
enrollment_date DATETIME DEFAULT GETDATE(),
status VARCHAR(20) DEFAULT 'active', -- active, dropped, completed
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
UNIQUE(user_id, course_id, term)
);

CREATE TABLE Messages (
message_id INT PRIMARY KEY IDENTITY(1,1),
user_id INT,
name VARCHAR(100),
email VARCHAR(100) NOT NULL,
subject VARCHAR(200) NOT NULL,
message TEXT NOT NULL,
is_read BIT DEFAULT 0,
created_at DATETIME DEFAULT GETDATE(),
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_courses_code ON Courses(course_code);
CREATE INDEX idx_courses_term ON Courses(term);
CREATE INDEX idx_enrollments_user ON Enrollments(user_id);
CREATE INDEX idx_enrollments_course ON Enrollments(course_id);
CREATE INDEX idx_messages_user ON Messages(user_id);


INSERT INTO Users (student_id, username, password, email, first_name, last_name, department, is_admin)
VALUES 
('BVCADMIN1', 'admin', 'admin123', 'admin@bowvalley.ca', 'Admin', 'User', 'SD', 1);

INSERT INTO Users (student_id, username, password, email, first_name, last_name, phone, birthday, department, program, is_admin)
VALUES 
('BVCS12345', 'john.doe', 'password123', 'john.doe@student.bowvalley.ca', 'John', 'Doe', '403-555-0001', '2000-05-15', 'SD', 'diploma', 0),
('BVCS67890', 'jane.smith', 'password123', 'jane.smith@student.bowvalley.ca', 'Jane', 'Smith', '403-555-0002', '1999-08-22', 'SD', 'postDiploma', 0),
('BVCST1234', 'bob.wilson', 'password123', 'bob.wilson@student.bowvalley.ca', 'Bob', 'Wilson', '403-555-0003', '2001-03-10', 'SD', 'certificate', 0);

INSERT INTO Programs (program_id, title, term, description, start_date, end_date, domestic_fee, international_fee, classification)
VALUES 
('SD-DIP', 'Software Development - Diploma (2 years)', 'Winter', 
 'A comprehensive two-year software development diploma program designed to equip students with practical skills in programming, web and mobile development, and software engineering principles.',
 '2024-09-05', '2026-06-15', 9254.00, 27735.00, 'Diploma'),
('SD-POST', 'Software Development - Post-Diploma (1 year)', 'Winter',
 'Jumpstart your tech career with our one-year post-diploma program in software development, focused on practical, job-ready skills.',
 '2024-09-05', '2025-06-15', 7895.00, 23675.00, 'Post-Diploma');

INSERT INTO Courses (course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee, is_custom)
VALUES 
('MGMT201', 'Essential Skills for Teams Collaboration', 'Spring', 'Software Development - Diploma',
 'practical skills in effective communication and teamwork.', '2024-03-01', '2024-06-30', 854.00, 2035.00, 0),
('SD102', 'Web Programming I', 'Spring', 'Software Development - Diploma',
 'HTML, CSS, basic JavaScript and DOM.', '2024-03-01', '2024-06-30', 850.00, 2000.00, 0),
('SD201', 'Introduction to Relational Databases', 'Fall', 'Software Development - Diploma',
 'Relational databases, SQL, normalization.', '2024-09-05', '2024-12-20', 854.00, 2735.00, 0),
('SD202', 'Web Programming II', 'Fall', 'Software Development - Diploma',
 'Advanced JS, frameworks and REST APIs.', '2024-09-05', '2024-12-20', 800.00, 2050.00, 0),
('SD301', 'Mobile Application Development with React', 'Summer', 'Software Development - Post-Diploma',
 'Mobile app basics for Android/iOS.', '2024-06-01', '2024-08-31', 895.00, 2675.00, 0),
('SD302', 'Object Oriented Programming', 'Winter', 'Software Development - Certificate',
 'Object Oriented design concepts and techniques', '2025-01-05', '2025-03-31', 850.00, 2000.00, 0);

INSERT INTO Enrollments (user_id, course_id, term)
VALUES 
(2, 1, 'Spring'), 
(2, 2, 'Spring'), 
(3, 3, 'Fall'),  
(3, 4, 'Fall');  

INSERT INTO Messages (user_id, name, email, subject, message, is_read)
VALUES 
(2, 'John Doe', 'john.doe@student.bowvalley.ca', 'Question about enrollment', 
 'Hi, I have a question about enrolling in additional courses for the Fall term.', 0),
(3, 'Jane Smith', 'jane.smith@student.bowvalley.ca', 'Course material access', 
 'I am unable to access the course materials for SD201. Can you help?', 1);

