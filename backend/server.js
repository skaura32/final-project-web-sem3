require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const config = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
sql.connect(config)
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => console.error('❌ Database connection failed:', err));

// ==================== ROUTES ====================
console.log('🔧 Loading routes...');

const userRoutes = require('./routes/users');
console.log('   ✓ users.js loaded');

const courseRoutes = require('./routes/courses');
console.log('   ✓ courses.js loaded');

const adminRoutes = require('./routes/admin');
console.log('   ✓ admin.js loaded');

const messageRoutes = require('./routes/messages');
console.log('   ✓ messages.js loaded');

const enrollmentRoutes = require('./routes/enrollments');
console.log('   ✓ enrollments.js loaded');

const authRoutes = require('./routes/auth');
console.log('   ✓ auth.js loaded');

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/auth', authRoutes);

console.log('✓ All routes registered!\n');
// ================================================

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Bow Course Registration API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            courses: '/api/courses',
            admin: '/api/admin',
            messages: '/api/messages',
            enrollments: '/api/enrollments',
            auth: '/api/auth',
            health: '/api/health'
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;