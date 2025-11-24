const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/database');

// POST - Enroll student in a course
router.post('/', async (req, res) => {
    try {
        const { student_id, course_id, term } = req.body;
        
        // Validation
        if (!student_id || !course_id || !term) {
            return res.status(400).json({ 
                success: false, 
                error: 'student_id, course_id, and term are required' 
            });
        }
        
        const pool = await poolPromise;
        
        // Get user_id from student_id
        const userResult = await pool.request()
            .input('student_id', sql.VarChar(20), student_id)
            .query('SELECT user_id FROM Users WHERE student_id = @student_id');
        
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student not found' 
            });
        }
        
        const user_id = userResult.recordset[0].user_id;
        
        // Check enrollment count for this term
        const countResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('term', sql.VarChar(20), term)
            .query('SELECT COUNT(*) as count FROM Enrollments WHERE user_id = @user_id AND term = @term');
        
        const enrollmentCount = countResult.recordset[0].count;
        
        if (enrollmentCount >= 5) {
            return res.status(400).json({ 
                success: false, 
                error: 'Maximum 5 courses allowed per term' 
            });
        }
        
        // Enroll student
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('course_id', sql.Int, course_id)
            .input('term', sql.VarChar(20), term)
            .query(`
                INSERT INTO Enrollments (user_id, course_id, term) 
                VALUES (@user_id, @course_id, @term);
                SELECT SCOPE_IDENTITY() AS enrollmentId;
            `);
        
        res.status(201).json({ 
            success: true, 
            message: 'Enrolled successfully',
            enrollmentId: result.recordset[0].enrollmentId
        });
    } catch (err) {
        if (err.number === 2627) { // Duplicate enrollment
            return res.status(400).json({ 
                success: false, 
                error: 'Already enrolled in this course for this term' 
            });
        }
        res.status(500).json({ 
            success: false, 
            error: 'Database error', 
            details: err.message 
        });
    }
});

// GET - Get student enrollments
router.get('/student/:studentId', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Get user_id from student_id
        const userResult = await pool.request()
            .input('student_id', sql.VarChar(20), req.params.studentId)
            .query('SELECT user_id FROM Users WHERE student_id = @student_id');
        
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student not found' 
            });
        }
        
        const user_id = userResult.recordset[0].user_id;
        
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`
                SELECT 
                    e.enrollment_id,
                    e.course_id,
                    c.course_code,
                    c.name,
                    c.term,
                    c.start_date,
                    c.end_date,
                    e.enrollment_date,
                    e.status
                FROM Enrollments e
                JOIN Courses c ON e.course_id = c.course_id
                WHERE e.user_id = @user_id
                ORDER BY e.enrollment_date DESC
            `);
        
        res.json({ 
            success: true, 
            enrollments: result.recordset,
            count: result.recordset.length 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Database error', 
            details: err.message 
        });
    }
});

// DELETE - Remove enrollment
router.delete('/:enrollmentId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('enrollmentId', sql.Int, req.params.enrollmentId)
            .query('DELETE FROM Enrollments WHERE enrollment_id = @enrollmentId');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Enrollment not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Enrollment removed successfully' 
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