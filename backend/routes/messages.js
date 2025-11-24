const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../config/database');

// POST - Student submits contact form
router.post('/', async (req, res) => {
    try {
        const { student_id, name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, email, subject, and message are required' 
            });
        }
        
        const pool = await sql.connect(config);
        
        // Get user_id from student_id if provided
        let userId = null;
        if (student_id) {
            const userResult = await pool.request()
                .input('student_id', sql.NVarChar, student_id)
                .query('SELECT user_id FROM Users WHERE student_id = @student_id');
            
            if (userResult.recordset.length > 0) {
                userId = userResult.recordset[0].user_id;
            }
        }
        
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('subject', sql.NVarChar, subject)
            .input('message', sql.NVarChar, message)
            .query(`
                INSERT INTO Messages (user_id, name, email, subject, message) 
                VALUES (@user_id, @name, @email, @subject, @message);
                SELECT SCOPE_IDENTITY() AS message_id;
            `);
        
        res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully',
            messageId: result.recordset[0].message_id
        });
    } catch (error) {
        console.error('Error submitting message:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error submitting message' 
        });
    }
});

// ✅ 7. GET - Admin views all messages
router.get('/', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query(`
                SELECT 
                    m.*,
                    u.first_name,
                    u.last_name,
                    u.program,
                    u.student_id
                FROM Messages m
                LEFT JOIN Users u ON m.user_id = u.user_id
                ORDER BY m.created_at DESC
            `);
        
        res.json({ 
            success: true, 
            messages: result.recordset,
            count: result.recordset.length 
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error fetching messages' 
        });
    }
});

// GET - Get single message by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT 
                    m.*,
                    u.first_name,
                    u.last_name,
                    u.program,
                    u.phone,
                    u.student_id
                FROM Messages m
                LEFT JOIN Users u ON m.user_id = u.user_id
                WHERE m.message_id = @id
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Message not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.recordset[0] 
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error fetching message' 
        });
    }
});

// PUT - Mark message as read
router.put('/:id/read', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                UPDATE Messages 
                SET is_read = 1 
                WHERE message_id = @id
            `);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Message not found' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Message marked as read' 
        });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error marking message as read' 
        });
    }
});

// DELETE - Delete a message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Messages WHERE message_id = @id');

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting message'
        });
    }
});

module.exports = router;