const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/database');

// Get all courses or search
router.get('/', async (req, res) => {
    try {
        const { search, term, program } = req.query;
        const pool = await sql.connect(config);
        
        let query = 'SELECT * FROM Courses WHERE 1=1';
        const request = pool.request();

        if (search) {
            query += ' AND (course_code LIKE @search OR name LIKE @search OR description LIKE @search)';
            request.input('search', sql.NVarChar, `%${search}%`);
        }

        if (term) {
            query += ' AND term = @term';
            request.input('term', sql.NVarChar, term);
        }

        if (program) {
            query += ' AND program = @program';
            request.input('program', sql.NVarChar, program);
        }

        query += ' ORDER BY term, course_code';

        const result = await request.query(query);

        res.json({
            success: true,
            courses: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching courses'
        });
    }
});

// Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Courses WHERE course_id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        res.json({
            success: true,
            course: result.recordset[0]
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching course'
        });
    }
});

// Create new course
router.post('/', async (req, res) => {
    try {
        const { course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee } = req.body;

        if (!course_code || !name || !term || !program) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('course_code', sql.NVarChar, course_code)
            .input('name', sql.NVarChar, name)
            .input('term', sql.NVarChar, term)
            .input('program', sql.NVarChar, program)
            .input('description', sql.NVarChar, description || '')
            .input('start_date', sql.Date, start_date || null)
            .input('end_date', sql.Date, end_date || null)
            .input('domestic_fee', sql.Decimal(10, 2), domestic_fee || 0)
            .input('international_fee', sql.Decimal(10, 2), international_fee || 0)
            .query(`
                INSERT INTO Courses (course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee)
                VALUES (@course_code, @name, @term, @program, @description, @start_date, @end_date, @domestic_fee, @international_fee);
                SELECT SCOPE_IDENTITY() AS course_id;
            `);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            courseId: result.recordset[0].course_id,
            course_code: course_code
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating course'
        });
    }
});

// Update course
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee } = req.body;

        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .input('course_code', sql.NVarChar, course_code)
            .input('name', sql.NVarChar, name)
            .input('term', sql.NVarChar, term)
            .input('program', sql.NVarChar, program)
            .input('description', sql.NVarChar, description)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('domestic_fee', sql.Decimal(10, 2), domestic_fee)
            .input('international_fee', sql.Decimal(10, 2), international_fee)
            .query(`
                UPDATE Courses 
                SET course_code = @course_code, 
                    name = @name, 
                    term = @term, 
                    program = @program, 
                    description = @description,
                    start_date = @start_date,
                    end_date = @end_date,
                    domestic_fee = @domestic_fee,
                    international_fee = @international_fee
                WHERE course_id = @id
            `);

        res.json({
            success: true,
            message: 'Course updated successfully'
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            error: 'Error updating course'
        });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Courses WHERE course_id = @id');

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting course'
        });
    }
});

// Get students enrolled in a course
router.get('/:id/students', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT u.student_id, u.first_name, u.last_name, u.email, u.phone, u.program, e.enrollment_date, e.status
                FROM Enrollments e
                JOIN Users u ON e.user_id = u.user_id
                WHERE e.course_id = @id
                ORDER BY e.enrollment_date DESC
            `);

        res.json({
            success: true,
            students: result.recordset,
            count: result.recordset.length
        });
    } catch (error) {
        console.error('Error fetching course students:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching students'
        });
    }
});

module.exports = router;