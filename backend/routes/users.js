const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config/database');

// GET /api/users - Get all users (Admin only)
router.get('/', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT user_id, student_id, username, email, first_name, last_name, phone, birthday, department, program, is_admin, created_at FROM Users ORDER BY created_at DESC');
        
        res.json({
            success: true,
            users: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching users',
            details: error.message
        });
    }
});

// GET /api/users/:id - Get single user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('user_id', sql.Int, id)
            .query('SELECT user_id, student_id, username, email, first_name, last_name, phone, birthday, department, program, is_admin, created_at FROM Users WHERE user_id = @user_id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: result.recordset[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user',
            details: error.message
        });
    }
});

// GET /api/users/profile/:studentId - Get user profile by student_id
router.get('/profile/:studentId', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('studentId', sql.NVarChar, req.params.studentId)
            .query(`
                SELECT 
                    user_id, student_id, username, email, first_name, last_name, 
                    phone, birthday, department, program, is_admin, created_at 
                FROM Users 
                WHERE student_id = @studentId
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        res.json({ 
            success: true, 
            user: result.recordset[0] 
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Database error', 
            details: error.message 
        });
    }
});

// POST /api/users/register - Register new student
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        const { 
            first_name, 
            last_name, 
            email, 
            phone, 
            birthday, 
            department, 
            program, 
            username, 
            password 
        } = req.body;
        
        // Validation
        if (!first_name || !last_name || !email || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields',
                required: ['first_name', 'last_name', 'email', 'username', 'password']
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
                error: 'Username already exists'
            });
        }

        // Check if email exists
        const checkEmail = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
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
            .input('student_id', sql.NVarChar, student_id)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('email', sql.NVarChar, email)
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('phone', sql.NVarChar, phone || null)
            .input('birthday', sql.Date, birthday || null)
            .input('department', sql.NVarChar, department || 'SD')
            .input('program', sql.NVarChar, program || null)
            .input('is_admin', sql.Bit, 0)
            .query(`
                INSERT INTO Users 
                (student_id, username, password, email, first_name, last_name, phone, birthday, department, program, is_admin)
                OUTPUT INSERTED.user_id
                VALUES (@student_id, @username, @password, @email, @first_name, @last_name, @phone, @birthday, @department, @program, @is_admin)
            `);
        
        console.log('✅ User registered successfully:', student_id);
        
        res.status(201).json({ 
            success: true, 
            message: 'Student registered successfully', 
            student_id: student_id,
            userId: result.recordset[0].user_id
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed', 
            details: error.message 
        });
    }
});

// POST /api/users/login - Student login
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login request received for:', req.body.username);
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password are required' 
            });
        }
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        const user = result.recordset[0];
        
        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        console.log('✅ Login successful for:', username);
        
        // Remove password from response
        delete user.password;
        
        res.json({ 
            success: true, 
            message: 'Login successful', 
            user: user
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error', 
            details: error.message 
        });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, phone, birthday, department, program } = req.body;
        
        const pool = await sql.connect(config);
        await pool.request()
            .input('user_id', sql.Int, id)
            .input('first_name', sql.NVarChar, first_name)
            .input('last_name', sql.NVarChar, last_name)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('birthday', sql.Date, birthday)
            .input('department', sql.NVarChar, department)
            .input('program', sql.NVarChar, program)
            .query(`
                UPDATE Users 
                SET first_name = @first_name,
                    last_name = @last_name,
                    email = @email,
                    phone = @phone,
                    birthday = @birthday,
                    department = @department,
                    program = @program
                WHERE user_id = @user_id
            `);
        
        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating user',
            details: error.message
        });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await sql.connect(config);
        await pool.request()
            .input('user_id', sql.Int, id)
            .query('DELETE FROM Users WHERE user_id = @user_id');
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting user',
            details: error.message
        });
    }
});

// GET /api/users/me - Get current user info
router.get('/me', async (req, res) => {
    try {
        // For now, get user from localStorage on frontend
        // Later add JWT authentication here
        const userId = req.query.user_id || req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const pool = await sql.connect(config);
        
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query('SELECT user_id, student_id, first_name, last_name, email, phone, birthday, department, program, is_admin FROM Users WHERE user_id = @user_id');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: result.recordset[0]
        });

    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
});

module.exports = router;