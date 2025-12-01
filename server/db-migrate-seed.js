const { getPool, mssql } = require('./db-sql');
const { loadJSON } = require('./utils/db');

async function run() {
  const pool = await getPool();
  const masterPool = await mssql.connect({ server: pool.config.server, database: 'master', options: pool.config.options, user: pool.config.user, password: pool.config.password, driver: pool.config.driver });

  const dbName = pool.config.database || 'bowdb';
  // Create DB if not exists
  await masterPool.request().query(`IF DB_ID(N'${dbName}') IS NULL CREATE DATABASE [${dbName}];`);

  console.log('Database created or already exists:', dbName);

  // Connect to target DB
  const targetCfg = { ...pool.config, database: dbName };
  const targetPool = await mssql.connect(targetCfg);

  // Create tables
  await targetPool.request().query(`
    IF OBJECT_ID('Users') IS NULL
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_id NVARCHAR(50) UNIQUE,
        username NVARCHAR(100) UNIQUE,
        password NVARCHAR(255),
        email NVARCHAR(255) UNIQUE,
        first_name NVARCHAR(100),
        last_name NVARCHAR(100),
        phone NVARCHAR(50),
        birthday DATE NULL,
        department NVARCHAR(100),
        program NVARCHAR(100),
        is_admin BIT DEFAULT 0
      );
  `);

  await targetPool.request().query(`
    IF OBJECT_ID('Programs') IS NULL
      CREATE TABLE Programs (
        program_id NVARCHAR(50) PRIMARY KEY,
        title NVARCHAR(255),
        term NVARCHAR(50),
        description NVARCHAR(MAX) NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        domestic_fee DECIMAL(18,2) NULL,
        international_fee DECIMAL(18,2) NULL,
        classification NVARCHAR(100) NULL
      );
  `);

  await targetPool.request().query(`
    IF OBJECT_ID('Courses') IS NULL
      CREATE TABLE Courses (
        id INT IDENTITY(1,1) PRIMARY KEY,
        course_code NVARCHAR(50) UNIQUE,
        name NVARCHAR(255),
        term NVARCHAR(50),
        program NVARCHAR(100),
        description NVARCHAR(MAX) NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        domestic_fee DECIMAL(18,2) NULL,
        international_fee DECIMAL(18,2) NULL
      );
  `);

  await targetPool.request().query(`
    IF OBJECT_ID('Enrollments') IS NULL
      CREATE TABLE Enrollments (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT REFERENCES Users(id),
        course_id INT REFERENCES Courses(id),
        term NVARCHAR(50),
        status NVARCHAR(50) DEFAULT 'active',
        created_at DATETIME DEFAULT GETDATE()
      );
  `);

  await targetPool.request().query(`
    IF OBJECT_ID('Messages') IS NULL
      CREATE TABLE Messages (
        id INT IDENTITY PRIMARY KEY,
        user_id INT,
        subject NVARCHAR(255),
        message NVARCHAR(MAX),
        is_read BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE()
      );
  `);

  console.log('Tables ensured');

  // Seed programs and courses
  const programs = loadJSON('programs.json') || [];
  for (const p of programs) {
    await targetPool.request().input('program_id', mssql.NVarChar, p.programId)
      .input('title', mssql.NVarChar, p.title)
      .input('term', mssql.NVarChar, p.term)
      .input('description', mssql.NVarChar, p.description || '')
      .query(`IF NOT EXISTS (SELECT 1 FROM Programs WHERE program_id=@program_id) INSERT INTO Programs (program_id, title, term, description) VALUES (@program_id, @title, @term, @description)`);
  }

  const courses = loadJSON('courses.json') || [];
  for (const c of courses) {
    await targetPool.request().input('course_code', mssql.NVarChar, c.courseCode)
      .input('name', mssql.NVarChar, c.name)
      .input('term', mssql.NVarChar, c.term)
      .input('program', mssql.NVarChar, c.program)
      .input('description', mssql.NVarChar, c.description || '')
      .query(`IF NOT EXISTS (SELECT 1 FROM Courses WHERE course_code=@course_code) INSERT INTO Courses (course_code, name, term, program, description) VALUES (@course_code, @name, @term, @program, @description)`);
  }

  console.log('Seeded programs & courses');

  // Seed admin user
  const users = loadJSON('users.json') || [];
  if (users && users.length) {
    for (const u of users) {
      await targetPool.request()
        .input('studentId', mssql.NVarChar, u.studentId)
        .input('username', mssql.NVarChar, u.username)
        .input('email', mssql.NVarChar, u.email)
        .input('password', mssql.NVarChar, u.password)
        .input('firstName', mssql.NVarChar, u.firstName)
        .input('lastName', mssql.NVarChar, u.lastName)
        .input('isAdmin', mssql.Bit, u.isAdmin ? 1 : 0)
        .query(`IF NOT EXISTS (SELECT 1 FROM Users WHERE username=@username OR email=@email) INSERT INTO Users (student_id, username, email, password, first_name, last_name, is_admin) VALUES (@studentId, @username, @email, @password, @firstName, @lastName, @isAdmin)`);
    }
  }

  console.log('Seeded users');
  console.log('Migration and seed completed');
  process.exit(0);
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });
