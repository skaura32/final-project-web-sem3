USE bow_course_registration;
GO

-- Insert Admin User (password: admin123)
INSERT INTO Users (student_id, username, password, email, first_name, last_name, department, is_admin)
VALUES ('ADMIN001', 'admin', '$2b$10$XPmKzHvz9xQY5t5KZqW3yO7lQlPQw9YZQkJzp5X8f5JfZm5KZqW3y', 'admin@bow.ca', 'Admin', 'User', 'SD', 1);

-- Insert Sample Students (password: student123)
INSERT INTO Users (student_id, username, password, email, first_name, last_name, phone, birthday, department, program)
VALUES 
('STU001', 'john.doe', '$2b$10$XPmKzHvz9xQY5t5KZqW3yO7lQlPQw9YZQkJzp5X8f5JfZm5KZqW3y', 'john.doe@bow.ca', 'John', 'Doe', '403-123-4567', '2000-05-15', 'SD', 'Diploma'),
('STU002', 'jane.smith', '$2b$10$XPmKzHvz9xQY5t5KZqW3yO7lQlPQw9YZQkJzp5X8f5JfZm5KZqW3y', 'jane.smith@bow.ca', 'Jane', 'Smith', '403-234-5678', '1999-08-20', 'SD', 'Post-Diploma'),
('STU003', 'mike.wilson', '$2b$10$XPmKzHvz9xQY5t5KZqW3yO7lQlPQw9YZQkJzp5X8f5JfZm5KZqW3y', 'mike.wilson@bow.ca', 'Mike', 'Wilson', '403-345-6789', '2001-03-10', 'SD', 'Certificate');

-- Insert Programs
INSERT INTO Programs (program_id, title, term, description, start_date, end_date, domestic_fee, international_fee, classification)
VALUES 
('SD-DIP', 'Software Development - Diploma', 'Winter', 'A comprehensive two-year software development diploma program', '2024-09-05', '2026-06-15', 9254.00, 27735.00, '2 years'),
('SD-POST', 'Software Development - Post-Diploma', 'Winter', 'One-year post-diploma program in software development', '2024-09-05', '2025-06-15', 7895.00, 23675.00, '1 year'),
('SD-CERT', 'Software Development - Certificate', 'Spring', 'Six-month certificate program', '2025-03-01', '2025-08-30', 4500.00, 13500.00, '6 months');

-- Insert Courses
INSERT INTO Courses (course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee)
VALUES 
('SODV1201', 'Introduction to Programming', 'Fall', 'Diploma', 'Learn programming fundamentals', '2024-09-05', '2024-12-15', 1200.00, 3600.00),
('SODV2201', 'Web Programming', 'Winter', 'Diploma', 'Full-stack web development', '2025-01-10', '2025-04-15', 1200.00, 3600.00),
('SODV3201', 'Mobile App Development', 'Spring', 'Diploma', 'Build mobile applications', '2025-03-01', '2025-06-15', 1200.00, 3600.00),
('SODV4201', 'Cloud Computing', 'Fall', 'Post-Diploma', 'Cloud technologies and deployment', '2024-09-05', '2024-12-15', 1500.00, 4500.00),
('SODV1101', 'Database Fundamentals', 'Winter', 'Certificate', 'Introduction to databases', '2025-01-10', '2025-04-15', 1000.00, 3000.00);

-- Insert Enrollments
INSERT INTO Enrollments (user_id, course_id, term, status)
VALUES 
(2, 1, 'Fall', 'active'),
(2, 2, 'Winter', 'active'),
(3, 4, 'Fall', 'active'),
(4, 5, 'Winter', 'active');

-- Insert Sample Messages
INSERT INTO Messages (user_id, name, email, subject, message)
VALUES 
(2, 'John Doe', 'john.doe@bow.ca', 'Course Registration Issue', 'I am having trouble registering for SODV3201. Please help.'),
(3, 'Jane Smith', 'jane.smith@bow.ca', 'Payment Question', 'When is the payment deadline for Winter term?');

GO