const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config/database');

// POST /api/auth/register - Student Signup
router.post('/register', async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            email, 
            phone, 
            birthday, 
            department, 
            program,  // ← This might be empty for admin
            username, 
            password 
        } = req.body;

        console.log('📝 Registration request received:', req.body);

        // Check if admin by email
        const isAdmin = email && email.endsWith('@bowvalley.ca');

        // ✅ Validation - program only required for students
        if (!first_name || !last_name || !email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: first_name, last_name, email, username, password'
            });
        }

        // ✅ Program required only for students
        if (!isAdmin && !program) {
            return res.status(400).json({
                success: false,
                message: 'Program is required for students'
            });
        }

        const pool = await sql.connect(config);

        // Check if username exists
        const checkUser = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists. Please choose a different username.'
            });
        }

        // Check if email exists
        const checkEmail = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please use a different email or login.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate student ID
        const studentIdResult = await pool.request()
            .query('SELECT COUNT(*) as count FROM Users WHERE is_admin = 0');
        const studentCount = studentIdResult.recordset[0].count;
        const student_id = `STU${String(studentCount + 1).padStart(3, '0')}`;

        // Insert user
        const result = await pool.request()
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone || null)
            .input('birthday', sql.Date, birthday || null)
            .input('department', sql.NVarChar, department || 'SD')
            .input('program', sql.NVarChar, program || 'N/A')  // ✅ Default for admins
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('is_admin', sql.Bit, isAdmin ? 1 : 0)
            .query(`
                INSERT INTO Users (first_name, last_name, email, phone, birthday, department, program, username, password, is_admin)
                OUTPUT INSERTED.user_id, INSERTED.first_name, INSERTED.last_name, INSERTED.email, INSERTED.is_admin
                VALUES (@first_name, @last_name, @email, @phone, @birthday, @department, @program, @username, @password, @is_admin)
            `);

        console.log('✅ User registered successfully:', student_id);

        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now login with your credentials.',
            student_id: student_id,
            user_id: result.recordset[0].user_id
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
});

// POST /api/auth/login - Student/Admin Login
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login request received for:', req.body.username);
        
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const pool = await sql.connect(config);

        // Get user
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = result.recordset[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        console.log('✅ Login successful for:', username);

        // Return user data (without password)
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                student_id: user.student_id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                birthday: user.birthday,
                department: user.department,
                program: user.program,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
});

module.exports = router;