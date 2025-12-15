const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/database');

// GET /api/registrations - Get user's course registrations
router.get('/', async (req, res) => {
    try {
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
            .query(`
                SELECT 
                    r.registration_id,
                    r.user_id,
                    r.course_id,
                    r.status,
                    r.registration_date,
                    c.course_code,
                    c.name as course_name,
                    c.description,
                    c.credits,
                    c.department
                FROM Registrations r
                INNER JOIN Courses c ON r.course_id = c.course_id
                WHERE r.user_id = @user_id
                ORDER BY r.registration_date DESC
            `);

        res.json({
            success: true,
            registrations: result.recordset
        });

    } catch (error) {
        console.error('❌ Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations',
            error: error.message
        });
    }
});

// POST /api/registrations - Register for a course
router.post('/', async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        
        if (!user_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id and course_id are required'
            });
        }

        const pool = await sql.connect(config);
        
        // Check if already registered
        const check = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('course_id', sql.Int, course_id)
            .query('SELECT * FROM Registrations WHERE user_id = @user_id AND course_id = @course_id');

        if (check.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this course'
            });
        }

        // Register for course
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('course_id', sql.Int, course_id)
            .input('status', sql.NVarChar, 'pending')
            .query(`
                INSERT INTO Registrations (user_id, course_id, status, registration_date)
                OUTPUT INSERTED.registration_id
                VALUES (@user_id, @course_id, @status, GETDATE())
            `);

        res.json({
            success: true,
            message: 'Successfully registered for course!',
            registration_id: result.recordset[0].registration_id
        });

    } catch (error) {
        console.error('❌ Error creating registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register for course',
            error: error.message
        });
    }
});

module.exports = router;