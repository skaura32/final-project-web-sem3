const express = require('express');
const router = express.Router();
const { sql, getConnection } = require('../config/database');

// GET enrollments for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, req.params.userId)
            .query(`
                SELECT e.*, c.course_code, c.name, c.term
                FROM Enrollments e
                JOIN Courses c ON e.course_id = c.course_id
                WHERE e.user_id = @userId
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST enroll in course
router.post('/', async (req, res) => {
    try {
        const { user_id, course_id, term } = req.body;
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('course_id', sql.Int, course_id)
            .input('term', sql.VarChar, term)
            .query(`
                INSERT INTO Enrollments (user_id, course_id, term)
                OUTPUT INSERTED.*
                VALUES (@user_id, @course_id, @term)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE enrollment
router.delete('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Enrollments WHERE enrollment_id = @id');
        
        res.json({ message: 'Enrollment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;