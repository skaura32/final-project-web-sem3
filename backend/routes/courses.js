const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/database');

// GET /api/courses - Get all courses
router.get('/', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT 
                    course_id,
                    course_code,
                    name,
                    term,
                    program,
                    description,
                    start_date,
                    end_date,
                    domestic_fee,
                    international_fee,
                    is_custom,
                    created_by,
                    created_at,
                    updated_at
                FROM Courses 
                ORDER BY course_code
            `);
        
        console.log('✅ Courses fetched:', result.recordset.length);
        
        // Return array directly (NOT wrapped in object)
        res.json(result.recordset);
        
    } catch (error) {
        console.error('❌ Error fetching courses:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching courses',
            details: error.message
        });
    }
});

// GET /api/courses/:id - Get single course
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('course_id', sql.Int, id)
            .query('SELECT * FROM Courses WHERE course_id = @course_id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.json(result.recordset[0]);
        
    } catch (error) {
        console.error('❌ Error fetching course:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching course',
            details: error.message
        });
    }
});

// POST /api/courses - Create course
router.post('/', async (req, res) => {
    try {
        const {
            course_code,
            name,
            term,
            program,
            description,
            start_date,
            end_date,
            domestic_fee,
            international_fee
        } = req.body;
        
        if (!course_code || !name || !term || !program) {
            return res.status(400).json({
                success: false,
                message: 'Required: course_code, name, term, program'
            });
        }
        
        const pool = await sql.connect(config);
        
        const result = await pool.request()
            .input('course_code', sql.NVarChar, course_code)
            .input('name', sql.NVarChar, name)
            .input('term', sql.NVarChar, term)
            .input('program', sql.NVarChar, program)
            .input('description', sql.NVarChar, description || null)
            .input('start_date', sql.Date, start_date || null)
            .input('end_date', sql.Date, end_date || null)
            .input('domestic_fee', sql.Decimal(10, 2), domestic_fee || 0)
            .input('international_fee', sql.Decimal(10, 2), international_fee || 0)
            .query(`
                INSERT INTO Courses 
                (course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee)
                OUTPUT INSERTED.course_id
                VALUES 
                (@course_code, @name, @term, @program, @description, @start_date, @end_date, @domestic_fee, @international_fee)
            `);
        
        res.status(201).json({
            success: true,
            message: 'Course created',
            course_id: result.recordset[0].course_id
        });
        
    } catch (error) {
        console.error('❌ Error creating course:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT /api/courses/:id - Update course
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            term,
            program,
            description,
            start_date,
            end_date,
            domestic_fee,
            international_fee
        } = req.body;
        
        const pool = await sql.connect(config);
        await pool.request()
            .input('course_id', sql.Int, id)
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
                SET name = @name,
                    term = @term,
                    program = @program,
                    description = @description,
                    start_date = @start_date,
                    end_date = @end_date,
                    domestic_fee = @domestic_fee,
                    international_fee = @international_fee
                WHERE course_id = @course_id
            `);
        
        res.json({
            success: true,
            message: 'Course updated'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const pool = await sql.connect(config);
        await pool.request()
            .input('course_id', sql.Int, id)
            .query('DELETE FROM Courses WHERE course_id = @course_id');
        
        res.json({
            success: true,
            message: 'Course deleted'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;