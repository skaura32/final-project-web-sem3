const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration - DIRECTLY DEFINED
const config = {
    user: 'kritika',
    password: 'j007@j007',
    server: 'LAPTOP-P8TVVSSQ\\SQLEXPRESS',
    database: 'bow_course_registration',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: 1433
};

console.log('🔧 Database Configuration (Direct):');
console.log('   User:', config.user);
console.log('   Server:', config.server);
console.log('   Database:', config.database);

// Test database connection
sql.connect(config)
    .then(() => {
        console.log('✓ Connected to SQL Server database');
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/enrollments', require('./routes/enrollments'));

// Root API endpoint
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Bow Course Registration API',
        version: '1.0.0',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            courses: '/api/courses',
            users: '/api/users',
            admin: '/api/admin',
            messages: '/api/messages',
            enrollments: '/api/enrollments'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date(),
        database: 'SQL Server - Connected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint not found',
        path: req.path 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ API available at http://localhost:${PORT}/api`);
});