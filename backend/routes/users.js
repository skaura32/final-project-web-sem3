const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/database');
const bcrypt = require('bcrypt');

// POST - Register new student
router.post('/register', async (req, res) => {
    try {
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
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate student ID
        const student_id = 'STU' + Date.now();
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('student_id', sql.VarChar(20), student_id)
            .input('username', sql.VarChar(50), username)
            .input('password', sql.VarChar(255), hashedPassword)
            .input('email', sql.VarChar(100), email)
            .input('first_name', sql.VarChar(50), first_name)
            .input('last_name', sql.VarChar(50), last_name)
            .input('phone', sql.VarChar(20), phone || null)
            .input('birthday', sql.Date, birthday || null)
            .input('department', sql.VarChar(10), department || 'SD')
            .input('program', sql.VarChar(50), program || null)
            .query(`
                INSERT INTO Users 
                (student_id, username, password, email, first_name, last_name, phone, birthday, department, program) 
                VALUES (@student_id, @username, @password, @email, @first_name, @last_name, @phone, @birthday, @department, @program);
                SELECT SCOPE_IDENTITY() AS userId;
            `);
        
        res.status(201).json({ 
            success: true, 
            message: 'Student registered successfully', 
            student_id: student_id,
            userId: result.recordset[0].userId
        });
    } catch (err) {
        if (err.number === 2627) { // Duplicate key
            return res.status(400).json({ 
                success: false, 
                error: 'Username or email already exists' 
            });
        }
        res.status(500).json({ 
            success: false, 
            error: 'Database error', 
            details: err.message 
        });
    }
});

// POST - Student login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username and password are required' 
            });
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.VarChar(50), username)
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
        
        // Remove password from response
        delete user.password;
        
        res.json({ 
            success: true, 
            message: 'Login successful', 
            user: user
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Server error', 
            details: err.message 
        });
    }
});

// GET - Get user profile by student_id
router.get('/profile/:studentId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('studentId', sql.VarChar(20), req.params.studentId)
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
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Database error', 
            details: err.message 
        });
    }
});

module.exports = router;