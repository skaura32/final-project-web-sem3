const express = require('express');
const router = express.Router();
const { sql, getConnection } = require('../config/database');

// GET all courses
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Courses');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET courses by term
router.get('/term/:term', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('term', sql.VarChar, req.params.term)
            .query('SELECT * FROM Courses WHERE term = @term');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create new course
router.post('/', async (req, res) => {
    try {
        const { course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee, created_by } = req.body;
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('course_code', sql.VarChar, course_code)
            .input('name', sql.VarChar, name)
            .input('term', sql.VarChar, term)
            .input('program', sql.VarChar, program)
            .input('description', sql.Text, description)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('domestic_fee', sql.Decimal(10, 2), domestic_fee)
            .input('international_fee', sql.Decimal(10, 2), international_fee)
            .input('created_by', sql.Int, created_by)
            .query(`
                INSERT INTO Courses (course_code, name, term, program, description, start_date, end_date, domestic_fee, international_fee, is_custom, created_by)
                OUTPUT INSERTED.*
                VALUES (@course_code, @name, @term, @program, @description, @start_date, @end_date, @domestic_fee, @international_fee, 1, @created_by)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update course
router.put('/:id', async (req, res) => {
    try {
        const { name, term, program, description, start_date, end_date, domestic_fee, international_fee } = req.body;
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.VarChar, name)
            .input('term', sql.VarChar, term)
            .input('program', sql.VarChar, program)
            .input('description', sql.Text, description)
            .input('start_date', sql.Date, start_date)
            .input('end_date', sql.Date, end_date)
            .input('domestic_fee', sql.Decimal(10, 2), domestic_fee)
            .input('international_fee', sql.Decimal(10, 2), international_fee)
            .query(`
                UPDATE Courses 
                SET name = @name, term = @term, program = @program, description = @description,
                    start_date = @start_date, end_date = @end_date, domestic_fee = @domestic_fee,
                    international_fee = @international_fee, updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE course_id = @id
            `);
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE course
router.delete('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Courses WHERE course_id = @id');
        
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;