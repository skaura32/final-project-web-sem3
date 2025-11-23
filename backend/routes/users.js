const express = require('express');
const router = express.Router();
const { sql, getConnection } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Users WHERE user_id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { student_id, username, password, email, first_name, last_name, phone, birthday, department, program } = req.body;
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('student_id', sql.VarChar, student_id)
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .input('email', sql.VarChar, email)
            .input('first_name', sql.VarChar, first_name)
            .input('last_name', sql.VarChar, last_name)
            .input('phone', sql.VarChar, phone)
            .input('birthday', sql.Date, birthday)
            .input('department', sql.VarChar, department)
            .input('program', sql.VarChar, program)
            .query(`
                INSERT INTO Users (student_id, username, password, email, first_name, last_name, phone, birthday, department, program)
                OUTPUT INSERTED.*
                VALUES (@student_id, @username, @password, @email, @first_name, @last_name, @phone, @birthday, @department, @program)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM Users WHERE username = @username AND password = @password');
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;