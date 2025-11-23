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
    status VARCHAR(20) DEFAULT 'active',
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