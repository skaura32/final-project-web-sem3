const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/database');

// GET - Get student enrollments by student_id (query parameter)
router.get('/', async (req, res) => {
    try {
        const { student_id } = req.query;
        
        if (!student_id) {
            return res.status(400).json({
                success: false,
                error: 'student_id query parameter is required'
            });
        }
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('student_id', sql.NVarChar, student_id)
            .query(`
                SELECT 
                    e.enrollment_id,
                    e.user_id,
                    e.course_id,
                    e.enrollment_date,
                    e.status,
                    c.course_code,
                    c.name as course_name,
                    c.term,
                    c.program,
                    c.start_date,
                    c.end_date,
                    c.domestic_fee,
                    c.international_fee,
                    u.student_id,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM Enrollments e
                INNER JOIN Courses c ON e.course_id = c.course_id
                INNER JOIN Users u ON e.user_id = u.user_id
                WHERE u.student_id = @student_id
                ORDER BY e.enrollment_date DESC
            `);
        
        res.json({
            success: true,
            enrollments: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching enrollments',
            details: error.message
        });
    }
});

// GET - Get all enrollments (Admin feature)
router.get('/all', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT 
                    e.enrollment_id,
                    e.user_id,
                    e.course_id,
                    e.enrollment_date,
                    e.status,
                    c.course_code,
                    c.name as course_name,
                    c.term,
                    u.student_id,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM Enrollments e
                INNER JOIN Courses c ON e.course_id = c.course_id
                INNER JOIN Users u ON e.user_id = u.user_id
                ORDER BY e.enrollment_date DESC
            `);
        
        res.json({
            success: true,
            enrollments: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching all enrollments:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching enrollments',
            details: error.message
        });
    }
});

// POST - Create new enrollment (Student registers for course)
router.post('/', async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        
        if (!user_id || !course_id) {
            return res.status(400).json({
                success: false,
                error: 'user_id and course_id are required'
            });
        }
        
        const pool = await sql.connect(config);
        
        // Check if already enrolled
        const checkResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('course_id', sql.Int, course_id)
            .query(`
                SELECT * FROM Enrollments 
                WHERE user_id = @user_id AND course_id = @course_id
            `);
        
        if (checkResult.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Student is already enrolled in this course'
            });
        }
        
        // Create enrollment
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('course_id', sql.Int, course_id)
            .input('status', sql.NVarChar, 'active')
            .query(`
                INSERT INTO Enrollments (user_id, course_id, enrollment_date, status)
                OUTPUT INSERTED.enrollment_id
                VALUES (@user_id, @course_id, GETDATE(), @status)
            `);
        
        res.status(201).json({
            success: true,
            message: 'Enrollment created successfully',
            enrollmentId: result.recordset[0].enrollment_id
        });
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating enrollment',
            details: error.message
        });
    }
});

// DELETE - Remove enrollment (Student drops course)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await sql.connect(config);
        await pool.request()
            .input('enrollment_id', sql.Int, id)
            .query('DELETE FROM Enrollments WHERE enrollment_id = @enrollment_id');
        
        res.json({
            success: true,
            message: 'Enrollment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting enrollment',
            details: error.message
        });
    }
});

module.exports = router;