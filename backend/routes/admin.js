const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('mssql');
const config = require('../config/database');

// Admin Login
router.post('/login', async (req, res) => {
    try {
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
            .query('SELECT * FROM Users WHERE username = @username AND is_admin = 1');

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid admin credentials'
            });
        }

        const admin = result.recordset[0];

        // Check password (plain text or bcrypt)
        let isPasswordValid = false;
        
        if (admin.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, admin.password);
        } else {
            isPasswordValid = (password === admin.password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid admin credentials'
            });
        }

        delete admin.password;

        res.json({
            success: true,
            message: 'Admin login successful',
            admin: {
                user_id: admin.user_id,
                student_id: admin.student_id,
                first_name: admin.first_name,
                last_name: admin.last_name,
                email: admin.email,
                is_admin: admin.is_admin
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during admin login'
        });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT user_id, student_id, username, email, first_name, last_name, phone, birthday, department, program FROM Users WHERE is_admin = 0 ORDER BY student_id');

        res.json({
            success: true,
            students: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching students'
        });
    }
});

// Get students by program
router.get('/students/program/:program', async (req, res) => {
    try {
        const { program } = req.params;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('program', sql.NVarChar, program)
            .query('SELECT user_id, student_id, username, email, first_name, last_name, phone, program FROM Users WHERE is_admin = 0 AND program = @program ORDER BY student_id');

        res.json({
            success: true,
            students: result.recordset,
            count: result.recordset.length,
            program: program
        });
    } catch (error) {
        console.error('Error fetching students by program:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching students'
        });
    }
});

module.exports = router;